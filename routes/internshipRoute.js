import express from "express";
import { Internship } from '../models/mainModel.js';
import { softwareKeywords, graphicKeywords, marketingKeywords, editingKeywords, financeKeywords, datascienceKeywords, businessdevelopmentKeywords, contentwritingKeyowords, humanresourcesKeywords, webDevKeywords } from './keywords.js';

const router = express.Router();

router.get('/all', async (req, res) => {
  try {
    const internships = await Internship.find({}, { heading_url: 1, _id: 0 });
    const internshipUrls = internships.map(internship => internship.heading_url);
    res.json({ internship_urls: internshipUrls });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/top6', async (req, res) => {
  try {
    const internships = await Internship.find().limit(6);
    res.json({ internships });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/top1k', async (req, res) => {
  try {
    const internships = await Internship.find().limit(1500);
    res.json({ internships });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/page', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 20;
  const skip = (page - 1) * limit;

  try {
    const totalCount = await Internship.countDocuments();
    const internships = await Internship.find().skip(skip).limit(limit);

    res.json({
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: page,
      internships,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/search', async (req, res) => {
  const queryName = req.query.name;
  const queryLocation = req.query.location;

  try {
    let query = {};

    if (queryName && queryLocation) {
      query = {
        internship_name: { $regex: `${queryName}`, $options: 'i' },
        location: { $regex: `${queryLocation}`, $options: 'i' }
      };
    } else if (queryName) {
      query = {
        internship_name: { $regex: `${queryName}`, $options: 'i' }
      };
    } else if (queryLocation) {
      query = {
        location: { $regex: `${queryLocation}`, $options: 'i' }
      };
    } else {
      return res.status(400).json({ message: 'Invalid search parameters. Please provide a name or location.' });
    }

    const internships = await Internship.find(query);

    if (internships.length > 0) {
      res.json({ internships });
    } else {
      if (queryName && queryLocation) {
        res.status(404).json({ message: `No internships found with names containing '${queryName}' in '${queryLocation}'` });
      } else if (queryName) {
        res.status(404).json({ message: `No internships found with names containing '${queryName}'` });
      } else if (queryLocation) {
        res.status(404).json({ message: `No internships found in '${queryLocation}'` });
      }
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

function createSearchRoute(category, keywords) {
  const route = `/category-search/${category.toLowerCase().replace(/\s+/g, '-')}`;
  console.log(`Generated route for ${category}: ${route}`);

  router.get(route, async (req, res) => {
    try {
      let bestMatches = [];
      let maxMatchCount = 0;

      for (const keyword of keywords) {
        const internships = await Internship.find({
          // skills: { $regex: keyword, $options: 'i' }
          internship_name: { $regex: keyword, $options: 'i' }
        });

        if (internships.length > maxMatchCount) {
          maxMatchCount = internships.length;
          bestMatches = internships;
        }
      }

      if (bestMatches.length > 0) {
        res.json({ internships: bestMatches });
      } else {
        res.status(404).json({ message: `No internships found for ${category} category.` });
      }
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
}

// Create search routes for each category
createSearchRoute('Software Development', softwareKeywords);
createSearchRoute('Graphics Designer', graphicKeywords);
createSearchRoute('Data Science', datascienceKeywords);
createSearchRoute('Business Development', businessdevelopmentKeywords);
createSearchRoute('Marketing', marketingKeywords);
createSearchRoute('Finance', financeKeywords);
createSearchRoute('Editor', editingKeywords);
createSearchRoute('Content Writer', contentwritingKeyowords);
createSearchRoute('Human Resources', humanresourcesKeywords);
createSearchRoute('Web Development', webDevKeywords);

// Search internships by heading_url
router.get(`/internship/detail/:heading_url`, async (req, res) => {
  const { heading_url } = req.params;

  try {
    const internship = await Internship.findOne({ heading_url });

    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    res.status(200).json(internship);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/update-internship/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const updatedFields = req.body;
    const internship = await Internship.findByIdAndUpdate(id, updatedFields, { new: true });

    if (!internship) {
      return res.status(404).json({ message: 'Internship not found' });
    }

    res.status(200).json({ updatedInternship: internship });
    console.log("updated");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add a new internship
router.post('/add', async (req, res) => {
  try {
    const {
      heading,
      heading_url,
      internship_name,
      internship_url,
      company_name,
      company_url,
      location,
      location_href,
      duration,
      stipend,
      img_link,
      about_company,
      activities,
      more_about,
      skills,
      who_can_apply
    } = req.body;

    const internship = new Internship({
      heading,
      heading_url,
      internship_name,
      internship_url,
      company_name,
      company_url,
      location,
      location_href,
      duration,
      stipend,
      img_link,
      about_company,
      activities,
      more_about,
      skills,
      who_can_apply
    });

    const newInternship = await internship.save();
    res.status(201).json({ newInternship });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete all internships
router.delete('/delete-all', async (req, res) => {
  try {
    await Internship.deleteMany();
    res.json({ message: 'Successfully deleted all internships' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
