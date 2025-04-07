import { REQUEST_TYPES } from './request.constants';

/**
 * Templates for common request types
 * These provide pre-filled content for different request types
 */
export interface RequestTemplate {
  title: string;
  description: string;
  request_type: string;
  amount?: string;
}

export const REQUEST_TEMPLATES: Record<string, RequestTemplate> = {
  [REQUEST_TYPES.SCHOLARSHIP]: {
    title: 'Scholarship Application',
    description: 
`I am applying for a scholarship to support my education at [School/University Name].

Current Education Level: [e.g., Secondary, University]
Course/Program: [e.g., Bachelor of Science in Engineering]
Duration: [e.g., 4 years]
Current Year of Study: [e.g., Year 2]

Why I need this scholarship:
[Explain your financial situation and why you need support]

How this scholarship will help me:
[Explain how this scholarship will impact your education and future]

My academic achievements:
[List any relevant academic achievements, grades, etc.]

My career goals:
[Briefly describe your career aspirations]`,
    request_type: REQUEST_TYPES.SCHOLARSHIP
  },
  
  [REQUEST_TYPES.GRANT]: {
    title: 'Grant Request for Project Funding',
    description: 
`I am requesting a grant to fund the following project:

Project Name: [Project Name]
Project Duration: [e.g., 6 months]
Location: [Where the project will be implemented]

Project Description:
[Provide a detailed description of the project]

Project Objectives:
1. [First objective]
2. [Second objective]
3. [Third objective]

Expected Outcomes:
[Describe the expected impact and outcomes of the project]

Budget Breakdown:
[Provide a brief breakdown of how the funds will be used]

Sustainability Plan:
[Explain how the project will be sustained after the grant period]`,
    request_type: REQUEST_TYPES.GRANT,
    amount: '5000'
  },
  
  [REQUEST_TYPES.HEALTH_WELLNESS]: {
    title: 'Health & Wellness Support Request',
    description: 
`I am requesting support for the following health and wellness needs:

Type of Support Needed: [e.g., Medical treatment, Health insurance, etc.]
Duration of Support: [e.g., One-time, 6 months, etc.]

Medical Condition (if applicable):
[Describe the medical condition requiring support]

Current Situation:
[Explain your current health situation and why you need support]

How this support will help:
[Describe how this support will improve your health and wellbeing]

Other support sources explored:
[List any other sources of support you have explored]`,
    request_type: REQUEST_TYPES.HEALTH_WELLNESS
  },
  
  [REQUEST_TYPES.EDUCATION]: {
    title: 'Education Support Request',
    description: 
`I am requesting support for the following educational needs:

Type of Support Needed: [e.g., School fees, Books, Uniform, etc.]
School/Institution: [Name of school or institution]
Grade/Level: [Current grade or education level]

Current Situation:
[Explain your current educational situation and why you need support]

How this support will help:
[Describe how this support will improve your education]

Academic Performance:
[Briefly describe your academic performance]

Future Educational Goals:
[Describe your educational aspirations]`,
    request_type: REQUEST_TYPES.EDUCATION
  }
};

/**
 * Get a template by request type
 * @param requestType The type of request
 * @returns The template for the request type or undefined if not found
 */
export function getTemplateByType(requestType: string): RequestTemplate | undefined {
  return REQUEST_TEMPLATES[requestType];
}
