export const getWorkshopTheme = (id = '', title = '') => {
  const idLower = id.toLowerCase();
  const titleLower = title.toLowerCase();

  // 1. LinkedIn Mastery
  if (idLower.includes('linkedin') || titleLower.includes('linkedin')) {
    return {
      primary: '#0A66C2',       // LinkedIn official blue
      secondary: '#5AAEFF',     // Light Blue
      accent: '#DDEEFF',        // Background Accent
      primaryAlpha: 'rgba(10, 102, 194, 0.45)',
      primaryGlow: 'rgba(10, 102, 194, 0.1)',
      primaryBorder: 'rgba(10, 102, 194, 0.3)',
      textHoverClass: 'group-hover:text-[#0A66C2]',
    };
  }

  // 2. Git & GitHub Workshop (Black / Gray Theme)
  if (idLower.includes('github') || idLower.includes('git') || titleLower.includes('github') || titleLower.includes('git')) {
    return {
      primary: '#D9D9D9',       // Light Gray for highlights and text contrast
      secondary: '#2F2F2F',     // Dark Gray
      accent: '#171515',        // GitHub black background
      primaryAlpha: 'rgba(217, 217, 217, 0.45)',
      primaryGlow: 'rgba(217, 217, 217, 0.1)',
      primaryBorder: 'rgba(217, 217, 217, 0.3)',
      bgOverride: '#171515',    // Special background override
      textHoverClass: 'group-hover:text-[#D9D9D9]',
    };
  }

  // 3. Web Development Workshop (Purple Theme)
  if (idLower.includes('web') || titleLower.includes('web')) {
    return {
      primary: '#7B2CFF',
      secondary: '#A855F7',
      accent: '#E9D5FF',
      primaryAlpha: 'rgba(123, 44, 255, 0.45)',
      primaryGlow: 'rgba(123, 44, 255, 0.1)',
      primaryBorder: 'rgba(123, 44, 255, 0.3)',
      textHoverClass: 'group-hover:text-[#A855F7]',
    };
  }

  // 4. App Development Workshop (Teal / Cyan Theme)
  if (idLower.includes('app') || titleLower.includes('app')) {
    return {
      primary: '#14B8A6',
      secondary: '#2DD4BF',
      accent: '#CCFBF1',
      primaryAlpha: 'rgba(20, 184, 166, 0.45)',
      primaryGlow: 'rgba(20, 184, 166, 0.1)',
      primaryBorder: 'rgba(20, 184, 166, 0.3)',
      textHoverClass: 'group-hover:text-[#2DD4BF]',
    };
  }

  // 5. Cyber Security / Data Science Workshop (Orange Theme)
  if (idLower.includes('cyber') || idLower.includes('security') || idLower.includes('data') || titleLower.includes('cyber') || titleLower.includes('security') || titleLower.includes('data')) {
    return {
      primary: '#F97316',
      secondary: '#FB923C',
      accent: '#FFEDD5',
      primaryAlpha: 'rgba(249, 115, 22, 0.45)',
      primaryGlow: 'rgba(249, 115, 22, 0.1)',
      primaryBorder: 'rgba(249, 115, 22, 0.3)',
      textHoverClass: 'group-hover:text-[#FB923C]',
    };
  }

  // 6. Soft Skills Workshop (Red Theme)
  if (idLower.includes('soft') || idLower.includes('presentation') || titleLower.includes('soft') || titleLower.includes('presentation')) {
    return {
      primary: '#EF4444',
      secondary: '#F87171',
      accent: '#FEE2E2',
      primaryAlpha: 'rgba(239, 68, 68, 0.45)',
      primaryGlow: 'rgba(239, 68, 68, 0.1)',
      primaryBorder: 'rgba(239, 68, 68, 0.3)',
      textHoverClass: 'group-hover:text-[#F87171]',
    };
  }

  // Default Fallback
  return {
    primary: '#0052ff',
    secondary: '#3b82f6',
    accent: '#dbeafe',
    primaryAlpha: 'rgba(0, 82, 255, 0.45)',
    primaryGlow: 'rgba(0, 82, 255, 0.15)',
    primaryBorder: 'rgba(0, 82, 255, 0.25)',
    textHoverClass: 'group-hover:text-cyber-blue',
  };
};
