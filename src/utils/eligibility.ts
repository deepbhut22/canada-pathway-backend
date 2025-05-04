import { LanguageTest, EducationEntry, SpouseInfo } from "./llmCalls";
import { WorkExperience } from "../types";
import { UserProfile } from "../types";
// Type definitions for eligibility input



// export interface UserProfile {
//     basicInfo: { age: number; };
//     languageInfo: {
//         primaryLanguageTest: LanguageTest;
//         secondLanguageTest?: LanguageTest;
//     };
//     educationInfo: { educationList: EducationEntry[] };
//     spouseInfo?: SpouseInfo;
//     workInfo: { workExperienceList: WorkExperience[] };
//     hasCertificateOfQualification?: boolean;
//     connectionInfo: { doesUserHaveFamilyInCanadaWhoIsCitizenOrPermanentResident: boolean };
// }

type ProgramCheck = {
    program: string;
    isEligible: boolean;
    reason: string[];
};

interface ProgramEligibilityResult {
    eligibilityStatus: [
        ProgramCheck,
        ProgramCheck,
        ProgramCheck
    ];
}

export function assessProgramEligibility(user: UserProfile): ProgramEligibilityResult {
    // Helper to check TEER‑0‑3 experience
    const hasTEER0to3Exp = (minMonths: number, countryFilter?: string) =>
        user.workInfo.workExperienceList.some(exp =>
            exp.teer >= 0 &&
            exp.teer <= 3 &&
            exp.numberOfMonths >= minMonths &&
            (countryFilter ? exp.country.toLowerCase() === countryFilter.toLowerCase() : true)
        );

    // 1. Federal Skilled Worker Program (FSWP)
    let fswpReason = '';
    let fswpEligible = true;

    if (!hasTEER0to3Exp(12)) {
        fswpReason = 'Less than 12 months of continuous TEER 0–3 work experience in the last 10 years.';
        fswpEligible = false;
    } else if (user.languageInfo.primaryLanguageTest.clbScore < 7) {
        fswpReason = `Language CLB ${user.languageInfo.primaryLanguageTest.clbScore} is below the required minimum of CLB 7.`;
        fswpEligible = false;
    } else {
        fswpReason = 'Meets ECA, has ≥1 year TEER 0–3 experience, and CLB 7+.';
    }

    const fswp: ProgramCheck = {
        program: 'Federal Skilled Worker Program (FSWP)',
        isEligible: fswpEligible,
        reason: [fswpReason]
    };

    // 2. Canadian Experience Class (CEC)
    let cecReason = '';
    let cecEligible = true;
    const hasCACanExp = hasTEER0to3Exp(12, 'Canada');

    if (!hasCACanExp) {
        cecReason = 'Less than 12 months of skilled Canadian (TEER 0–3) work experience in the past 3 years.';
        cecEligible = false;
    } else {
        const teerLevels = user.workInfo.workExperienceList
            .filter(exp => exp.country.toLowerCase() === 'canada' && exp.numberOfMonths >= 12)
            .map(exp => exp.teer);
        const maxTEER = Math.min(...teerLevels);
        const requiredCLB = (maxTEER === 0 || maxTEER === 1) ? 7 : 5;

        if (user.languageInfo.primaryLanguageTest.clbScore < requiredCLB) {
            cecReason = `Canadian experience TEER ${maxTEER} requires CLB ${requiredCLB}, but language CLB is ${user.languageInfo.primaryLanguageTest.clbScore}.`;
            cecEligible = false;
        } else {
            cecReason = `Has ≥1 year Canadian TEER ${maxTEER} experience and CLB ${user.languageInfo.primaryLanguageTest.clbScore} meets the required CLB ${requiredCLB}.`;
        }
    }

    const cec: ProgramCheck = {
        program: 'Canadian Experience Class (CEC)',
        isEligible: cecEligible,
        reason: [cecReason]
    };

    // 3. Federal Skilled Trades Program (FSTP)
    let fstpReason = '';
    let fstpEligible = true;

    const tradeGroups = ["72", "73", "82", "83", "92", "93", "632", "633"];
    const hasTradeExp24 = user.workInfo.workExperienceList.some(exp =>
        (exp.teer == 2 || exp.teer == 3) &&
        exp.numberOfMonths >= 24 &&
        tradeGroups.some(code => exp.nocCode.startsWith(code))
    );

    const clb = user.languageInfo.primaryLanguageTest.clbScore;
    const langOK = clb >= 5;
    const hasJobOrCert = !!user.jobOfferInfo?.hasJobOffer;

    if (!hasTradeExp24) {
        fstpReason = "Less than 24 months of continuous TEER 2–3 trade experience in eligible NOC groups in the last 5 years.";
        fstpEligible = false;
    } else if (!langOK) {
        fstpReason = `Language CLB ${clb} below required minimum of CLB 5 for speaking / listening(and CLB 4 for reading / writing).`;
        fstpEligible = false;
    } else if (!hasJobOrCert) {
        fstpReason = "No valid 1‑year job offer or provincial/federal trade certification.";
        fstpEligible = false;
    } else {
        fstpReason = "Meets 24 months TEER 2–3 trade experience in eligible NOC groups, CLB 5+, and has job offer or trade certification.";
    }

    const fstp: ProgramCheck = {
        program: 'Federal Skilled Trades Program (FSTP)',
        isEligible: fstpEligible,
        reason: [fstpReason]
    };
    
    return {
        eligibilityStatus: [ fswp, cec, fstp ]
    };
}

