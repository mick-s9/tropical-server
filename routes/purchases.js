const express = require('express');
const User = require('../models/User');
const { getExperienceLevel } = require('../Utils/experienceLevels');
const router = express.Router();

router.post('/purchase-level-package', async (req, res) => {
  const { userId, packageType } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    const levelPackages = {
      Intermediate: 35,
      Specialist: 75,
      Master: 100,
      GrandMaster: 200,
      Elite: 300,
      Legend: 400,
      Ancestral: 500,
      Immortal: 600,
      Arcane: 800
    };

    if (!levelPackages[packageType]) {
      return res.status(400).send('Invalid package type');
    }

    user.completedProjects = levelPackages[packageType];
    user.experienceLevel = getExperienceLevel(user.completedProjects);
    await user.save();

    res.status(200).send('Experience level package purchased successfully');
  } catch (err) {
    res.status(500).send('Error purchasing level package');
  }
});

module.exports = router;
