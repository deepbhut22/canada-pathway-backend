import { assessProgramEligibility } from "./eligibility";
import {crsScorePrompt} from "./prompts/crsScorePrompt";
import { OpenAI } from "openai";
import { assessCategoryBasedEligibility } from "./categoryEligibility";
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});


export const expressEntryReport = async (userProfile: any) => {
    try {

        // const report = calculateCrsScore(userProfile);
        // const report = assessProgramEligibility(userProfile);
        return {...assessCategoryBasedEligibility(userProfile), ...calculateCrsScore(userProfile), ...assessProgramEligibility(userProfile)};
        // const prompt = crsScorePrompt(userProfile);
        
        // const completion = await openai.chat.completions.create({
        //     model: 'gpt-4.1-mini',
        //     messages: [{ role: 'user', content: prompt }],
        //     temperature: 0.4,
        //     response_format: { type: 'json_object' }
        // });
        
        // const report = completion.choices[0]?.message?.content;
    } catch (error) {
        console.log(error);
        return null;
    }
}

// Type definitions for user profile input
export type EducationType = 'highSchool' | 'oneYear' | 'twoYear' | 'bachelor' | 'masters' | 'phd';
export interface EducationEntry { type: EducationType; country: string; }
export interface LanguageTest { clbScore: number; }
export interface WorkExperience {
    jobTitle: string;
    // isPaid: boolean;
    isSelfEmployed: boolean;
    // hoursPerWeek: number;
    country: string;
    province?: string;
    workPermitType?: string;
    // hasLMIA: boolean;
    nocCode: string;
    // startDate: string;
    // endDate: string;
    isCurrentJob: boolean;
    numberOfMonths: number;
    teer: string;
}
export interface SpouseInfo { maritalStatus: 'single' | 'married'; hasCanadianWorkExp: boolean; educationLevel: EducationType; }
export interface UserProfile {
    basicInfo: { age: number; };
    languageInfo: {
        primaryLanguageTest: LanguageTest;
        secondLanguageTest?: LanguageTest;
    };
    educationInfo: { educationList: EducationEntry[] };
    spouseInfo?: SpouseInfo;
    workInfo: { workExperienceList: WorkExperience[] };
    hasCertificateOfQualification?: boolean;
    connectionInfo: { doesUserHaveFamilyInCanadaWhoIsCitizenOrPermanentResident: boolean };
}

// Type for CRS calculation result
export type CrsBreakdown = {
    score: number;
    maximum: number;
    reason: string[];
};
export interface CrsResult {
    expressEntryProfile: {
        crsScore: number;
        scoreBreakdown: {
            coreHumanCapital: CrsBreakdown;
            spouseFactors: CrsBreakdown;
            skillTransferability: CrsBreakdown;
            additionalPoints: CrsBreakdown;
        };
    };
}

export function calculateCrsScore(user: UserProfile): CrsResult {
    const withSpouse = user.spouseInfo?.maritalStatus === 'married';

    // 1. Core/Human Capital
    const age = user.basicInfo.age;
    const ageScore = computeAgePoints(age, withSpouse);
    const ageReasons = [`Age ${age} → ${ageScore} points (${withSpouse ? 'with spouse' : 'without spouse'})`];

    const educationType = getHighestEducationType(user.educationInfo.educationList);
    const educationScore = computeEducationPoints(educationType, withSpouse);
    const eduReasons = [`Education level "${educationType}" → ${educationScore} points`];

    const primaryClb = user.languageInfo.primaryLanguageTest.clbScore;
    const firstLangScore = computeFirstLanguagePoints(primaryClb, withSpouse);
    const firstLangReasons = [`Primary language CLB${primaryClb} → ${firstLangScore} points`];

    const secondClb = user.languageInfo.secondLanguageTest?.clbScore ?? 0;
    const secondLangScore = computeSecondLanguagePoints(secondClb, withSpouse);
    const secondLangReasons = [`Second language CLB${secondClb} → ${secondLangScore} points`];

    const canadianMonths = user.workInfo.workExperienceList
        .filter(e => e.country.toLowerCase() === 'canada')
        .reduce((sum, e) => sum + e.numberOfMonths, 0);


    const foreignMonths = user.workInfo.workExperienceList
        .filter(e => e.country.toLowerCase() !== 'canada')
        .reduce((sum, e) => sum + e.numberOfMonths, 0);

    const foreignYears = foreignMonths / 12;

    const workYears = canadianMonths / 12;
    const workScore = computeCanadianWorkPoints(workYears, withSpouse);
    const workReasons = [`Canadian work experience ${workYears.toFixed(1)} years → ${workScore} points`];

    const coreScore = ageScore + educationScore + firstLangScore + secondLangScore + workScore;
    const coreReasons = [...ageReasons, ...eduReasons, ...firstLangReasons, ...secondLangReasons, ...workReasons];


// 2. Spouse Factors
    let spouseScore = 0;
    let spouseReasons: string[] = ['No spouse factors applied'];
    if (withSpouse && user.spouseInfo) {
        const spEdu = computeSpouseEducationPoints(user.spouseInfo.educationLevel);
        const spWork = 0;
        const spLang = 20;
        spouseScore = spEdu + spWork + spLang;
        spouseReasons = [
            `Spouse education → ${spEdu} points`,
            `Spouse Canadian work → ${spWork} points`,
            `Spouse language → ${spLang} points`
        ];
    }

// 3. Skill Transferability
    const edA = computeSkillEdLangPoints(educationType, primaryClb);
    const edB = computeSkillEdCanXpPoints(educationType, workYears);
    const fA = computeSkillForLangPoints(foreignYears, primaryClb);
    const fB = computeSkillForCanXpPoints(foreignYears, workYears);
    const skillScore = Math.min(edA + edB, 50) + Math.min(fA + fB, 50);
    const skillReasons = [
        `Education + language → ${edA} points`,
        `Education + Canadian XP → ${edB} points`,
        `Foreign + language → ${fA} points`,
        `Foreign + Canadian XP → ${fB} points`
    ];

// 4. Additional Points
    const canEduBonus = ['oneYear', 'twoYear'].includes(educationType) ? 15 :
        ['bachelor', 'masters', 'phd'].includes(educationType) ? 30 : 0;
    const siblingBonus = user.connectionInfo.doesUserHaveFamilyInCanadaWhoIsCitizenOrPermanentResident ? 15 : 0;
    const frenchBonus = computeFrenchBonus(primaryClb, secondClb);
    const additionalScore = canEduBonus + siblingBonus + frenchBonus;
    const additionalReasons = [
        `Canadian education → ${canEduBonus} points`,
        `Sibling in Canada → ${siblingBonus} points`,
        `French proficiency → ${frenchBonus} points`
    ];

const total = coreScore + spouseScore + skillScore + additionalScore;

    return {
        expressEntryProfile: {
            crsScore: total,
            scoreBreakdown: {
                coreHumanCapital: {
                    score: coreScore,
                    maximum: 500,
                    reason: coreReasons
                },
                spouseFactors: {
                    score: spouseScore,
                    maximum: 40,
                    reason: spouseReasons
                },
                skillTransferability: {
                    score: skillScore,
                    maximum: 100,
                    reason: skillReasons
                },
                additionalPoints: {
                    score: additionalScore,
                    maximum: 600,
                    reason: additionalReasons
                }
            }
        }
    };

}

// Helper functions
function computeAgePoints(age: number, withSpouse: boolean): number {
    const m = withSpouse ? 0 : 1;
    if (age < 18 || age > 44) return 0;
    if (age === 18) return [90, 99][m];
    if (age === 19) return [95, 105][m];
    if (age >= 20 && age <= 29) return [100, 110][m];
    const table = [
        [95, 105], [90, 99], [85, 94], [80, 88], [75, 83],
        [70, 77], [65, 72], [60, 66], [55, 61], [50, 55],
        [45, 50], [35, 39], [25, 28], [15, 17], [5, 6]
    ];
    return table[age - 30]?.[m] ?? 0;
}

function computeEducationPoints(type: EducationType, withSpouse: boolean): number {
    const m = withSpouse ? 0 : 1;
    switch (type) {
        case 'highSchool': return [28, 30][m];
        case 'oneYear': return [84, 90][m];
        case 'twoYear': return [91, 98][m];
        case 'bachelor': return [112, 120][m];
        case 'masters': return [126, 135][m];
        case 'phd': return [140, 150][m];
    }
}

function computeFirstLanguagePoints(clb: number, withSpouse: boolean): number {
    const m = withSpouse ? 0 : 1;
    if (clb >= 10) return [128, 136][m];
    if (clb === 9) return [116, 124][m];
    if (clb === 8) return [88, 92][m];
    if (clb === 7) return [64, 68][m];
    if (clb === 6) return [32, 36][m];
    return 0;
}

function computeSecondLanguagePoints(clb: number, withSpouse: boolean): number {
    if (clb >= 5) return withSpouse ? 22 : 24;
    return 0;
}

function computeCanadianWorkPoints(years: number, withSpouse: boolean): number {
    const m = withSpouse ? 0 : 1;
    if (years < 1) return 0;
    if (years < 2) return [35, 40][m];
    if (years < 3) return [46, 53][m];
    if (years < 4) return [56, 64][m];
    if (years < 5) return [63, 72][m];
    return [70, 80][m];
}

function computeSpouseEducationPoints(type: EducationType): number {
    switch (type) {
        case 'highSchool': return 0;
        case 'oneYear': return 6;
        case 'twoYear': return 7;
        case 'bachelor': return 8;
        case 'masters': return 10;
        case 'phd': return 10;
    }
}

function getHighestEducationType(list: EducationEntry[]): EducationType {
    const order: EducationType[] = ['highSchool', 'oneYear', 'twoYear', 'bachelor', 'masters', 'phd'];
    return list.map(e => e.type).sort((a, b) => order.indexOf(a) - order.indexOf(b)).pop()!;
}

function computeSkillEdLangPoints(type: EducationType, clb: number): number {
    let pts = 0;
    if (['oneYear', 'twoYear', 'bachelor'].includes(type)) {
        if (clb >= 9) pts = 25;
        else if (clb >= 7) pts = 13;
    } else if (['masters', 'phd'].includes(type)) {
        if (clb >= 9) pts = 50;
        else if (clb >= 7) pts = 25;
    }
    return pts;
}

function computeSkillEdCanXpPoints(type: EducationType, canYrs: number): number {
    let pts = 0;
    if (['oneYear', 'twoYear', 'bachelor'].includes(type)) {
        if (canYrs >= 2) pts = 25;
        else if (canYrs >= 1) pts = 13;
    } else if (['masters', 'phd'].includes(type)) {
        if (canYrs >= 2) pts = 50;
        else if (canYrs >= 1) pts = 25;
    }
    return pts;
}

function computeSkillForLangPoints(forYrs: number, clb: number): number {
    let pts = 0;
    if (forYrs >= 3) {
        if (clb >= 9) pts = 50;
        else if (clb >= 7) pts = 25;
    } else if (forYrs >= 1) {
        if (clb >= 9) pts = 25;
        else if (clb >= 7) pts = 13;
    }
    return pts;
}

function computeSkillForCanXpPoints(forYrs: number, canYrs: number): number {
    let pts = 0;
    if (forYrs >= 3) {
        if (canYrs >= 2) pts = 50;
        else if (canYrs >= 1) pts = 25;
    } else if (forYrs >= 1) {
        if (canYrs >= 2) pts = 25;
        else if (canYrs >= 1) pts = 13;
    }
    return pts;
}

function computeFrenchBonus(engClb: number, fraClb: number): number {
    if (fraClb < 7) return 0;
    return engClb >= 5 ? 75 : 25;
}



