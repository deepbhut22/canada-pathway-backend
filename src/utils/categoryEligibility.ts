import { UserProfile } from "../types";
import { WorkExperience } from "../types";

// Type definitions for user profile input
type LanguageTest = {
    test: 'TEF' | 'TCF' | string;
    clbScore: number;
};

// Type for category eligibility result
interface CategoryCheck {
    program: string;
    isEligible: boolean;
    reason: string;
}

interface CategoryEligibilityResult {
    categoryBasedEligibility: CategoryCheck[];
}

// NOC lists for each category
const HEALTHCARE_SOCIAL_NOC = new Set([
    "31112", "31201", "31110", "31121", "31102", "32101", "32201", "32120", "32121", "32122", "31302", "31300",
    "31203", "31111", "31209", "32102", "31120", "32124", "31303", "31202", "31200", "31301", "32103", "41300",
    "41301", "31100", "31101", "31103"
]);

const STEM_NOC = new Set([
    "20011", "21300", "22300", "21220", "21310", "22310", "21331", "21321", "21301", "22301", "63100"
]);

const TRADE_NOC = new Set([
    "82021", "73113", "73112", "73110", "73100", "72999", "72501", "72422", "72402", "72401", "72400",
    "72320", "72311", "72310", "72302", "72300", "72201", "72200", "72106", "72102", "72100", "70011",
    "70010", "63200", "22303"
]);

const AGRI_NOC = new Set([
    "63201", "65202", "94141", "82030", "84120", "85100", "85101", "95106"
]);

const EDUCATION_NOC = new Set([
    "43100", "42203", "42202", "41221", "41220"
]);

/**
 * Assess eligibility under the six category‑based selection streams.
 */
export function assessCategoryBasedEligibility(user: UserProfile): CategoryEligibilityResult {
    // 1. French‑language proficiency

    const x = user.languageInfo.primaryLanguage === 'French';

    const tefTcfTests = x ? [user.languageInfo.primaryLanguageTest] : [user.languageInfo.secondLanguageTest];

    // const tefTcfTests = user.languageInfo.primaryLanguageTest.type === 'TEF' || user.languageInfo.primaryLanguageTest.type === 'TCF' 
    //     ? [user.languageInfo.primaryLanguageTest] 
    //     : [];
    const frenchTest = tefTcfTests.find(t => t.clbScore >= 7);
    const frenchEligible = !!frenchTest;
    const frenchDetails = frenchEligible
        ? `Has ${frenchTest!.type} with CLB ${frenchTest!.clbScore} (≥ 7).`
        : tefTcfTests.length > 0
        ? `Highest CLB on TEF / TCF is ${ Math.max(...tefTcfTests.map(t => t.clbScore)) }, below 7.`
        : 'No valid TEF or TCF test found.';

// Helper: at least 6 months in given NOC set
const hasSixMonths = (set: Set<string>) =>
    user.workInfo.workExperienceList.some(exp => set.has(exp.nocCode) && exp.numberOfMonths >= 6);

// 2. Healthcare & social services
const healthcareEligible = hasSixMonths(HEALTHCARE_SOCIAL_NOC);
const healthcareDetails = healthcareEligible
    ? 'Has ≥ 6 months in a targeted healthcare/social‑services NOC in last 3 years.'
    : 'No ≥ 6 months of continuous experience in listed healthcare/social‑services NOCs.';

// 3. STEM occupations
const stemEligible = hasSixMonths(STEM_NOC);
const stemDetails = stemEligible
    ? 'Has ≥ 6 months in a targeted STEM NOC in last 3 years.'
    : 'No ≥ 6 months of continuous experience in listed STEM NOCs.';

// 4. Trade occupations
const tradeEligible = hasSixMonths(TRADE_NOC);
const tradeDetails = tradeEligible
    ? 'Has ≥ 6 months in a targeted trade NOC in last 3 years.'
    : 'No ≥ 6 months of continuous experience in listed trade NOCs.';

// 5. Agriculture & agri‑food occupations
const agriEligible = hasSixMonths(AGRI_NOC);
const agriDetails = agriEligible
    ? 'Has ≥ 6 months in a targeted agriculture/agri‑food NOC in last 3 years.'
    : 'No ≥ 6 months of continuous experience in listed agriculture/agri‑food NOCs.';

// 6. Education occupations
const eduEligible = hasSixMonths(EDUCATION_NOC);
const eduDetails = eduEligible
    ? 'Has ≥ 6 months in a targeted education NOC in last 3 years.'
    : 'No ≥ 6 months of continuous experience in listed education NOCs.';

return {
    categoryBasedEligibility: [
        {
            program: 'French-language proficiency',
            isEligible: frenchEligible,
            reason: frenchDetails
        },
        {
            program: 'Healthcare and social services occupations',
            isEligible: healthcareEligible,
            reason: healthcareDetails
        },
        {
            program: 'Science, Technology, Engineering and Math (STEM) occupations',
            isEligible: stemEligible,
            reason: stemDetails
        },
        {
            program: 'Trade occupations',
            isEligible: tradeEligible,
            reason: tradeDetails
        },
        {
            program: 'Agriculture and agri-food occupations',
            isEligible: agriEligible,
            reason: agriDetails
        },
        {
            program: 'Education occupations',
            isEligible: eduEligible,
            reason: eduDetails
        }
    ]
};
}