const getExperienceLevel = (completedProjects) => {
    if (completedProjects >= 800) return 'Arcane';
    if (completedProjects >= 600) return 'Immortal';
    if (completedProjects >= 500) return 'Ancestral';
    if (completedProjects >= 400) return 'Legend';
    if (completedProjects >= 300) return 'Elite';
    if (completedProjects >= 200) return 'Grand Master';
    if (completedProjects >= 100) return 'Master';
    if (completedProjects >= 75) return 'Specialist';
    if (completedProjects >= 35) return 'Intermediate';
    return 'Beginner';
  };
  
  module.exports = { getExperienceLevel };
  