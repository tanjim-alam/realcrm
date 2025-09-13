const express = require('express');
const { body, validationResult } = require('express-validator');
const FormTemplate = require('../models/FormTemplate');
const Lead = require('../models/Lead');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   GET /api/form-templates
// @desc    Get all form templates for the company
// @access  Private
router.get('/', async (req, res) => {
  try {
    const templates = await FormTemplate.find({ companyId: req.user.companyId })
      .sort({ createdAt: -1 });

    res.json(templates);
  } catch (error) {
    console.error('Get form templates error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/form-templates/:id
// @desc    Get single form template
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const template = await FormTemplate.findOne({
      _id: req.params.id,
      companyId: req.user.companyId
    });

    if (!template) {
      return res.status(404).json({ message: 'Form template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Get form template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/form-templates
// @desc    Create new form template
// @access  Private (Admin only)
router.post('/', [
  roleMiddleware(['admin']),
  body('name').notEmpty().withMessage('Template name is required'),
  body('fields').isArray().withMessage('Fields must be an array'),
  body('fields.*.name').notEmpty().withMessage('Field name is required'),
  body('fields.*.label').notEmpty().withMessage('Field label is required'),
  body('fields.*.type').isIn(['text', 'email', 'tel', 'number', 'select', 'textarea', 'checkbox', 'radio']).withMessage('Invalid field type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const templateData = {
      ...req.body,
      companyId: req.user.companyId
    };

    const template = new FormTemplate(templateData);
    await template.save();

    res.status(201).json(template);
  } catch (error) {
    console.error('Create form template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/form-templates/:id
// @desc    Update form template
// @access  Private (Admin only)
router.put('/:id', [
  roleMiddleware(['admin']),
  body('name').optional().notEmpty().withMessage('Template name cannot be empty'),
  body('fields').optional().isArray().withMessage('Fields must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const template = await FormTemplate.findOneAndUpdate(
      { _id: req.params.id, companyId: req.user.companyId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!template) {
      return res.status(404).json({ message: 'Form template not found' });
    }

    res.json(template);
  } catch (error) {
    console.error('Update form template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/form-templates/:id
// @desc    Delete form template
// @access  Private (Admin only)
router.delete('/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    const template = await FormTemplate.findOneAndDelete({
      _id: req.params.id,
      companyId: req.user.companyId
    });

    if (!template) {
      return res.status(404).json({ message: 'Form template not found' });
    }

    res.json({ message: 'Form template deleted successfully' });
  } catch (error) {
    console.error('Delete form template error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/form-templates/:id/generate
// @desc    Generate HTML form code for template
// @access  Private
router.get('/:id/generate', async (req, res) => {
  try {
    const template = await FormTemplate.findOne({
      _id: req.params.id,
      companyId: req.user.companyId
    });

    if (!template) {
      return res.status(404).json({ message: 'Form template not found' });
    }

    // Generate HTML form code
    const formCode = generateFormHTML(template, req.user.companyId);

    res.json({
      template,
      htmlCode: formCode,
      cssCode: generateFormCSS(template.settings.theme),
      jsCode: generateFormJS(template._id, req.user.companyId)
    });
  } catch (error) {
    console.error('Generate form code error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to generate HTML form
function generateFormHTML(template, companyId) {
  let html = `<form id="dynamicForm" class="dynamic-form">`;
  
  template.fields.forEach(field => {
    html += generateFieldHTML(field);
  });
  
  html += `
    <button type="submit" class="submit-btn">${template.settings.submitButtonText}</button>
  </form>`;
  
  return html;
}

function generateFieldHTML(field) {
  const required = field.required ? 'required' : '';
  const placeholder = field.placeholder ? `placeholder="${field.placeholder}"` : '';
  
  switch (field.type) {
    case 'text':
    case 'email':
    case 'tel':
    case 'number':
      return `
        <div class="form-group">
          <label for="${field.name}">${field.label} ${field.required ? '*' : ''}</label>
          <input type="${field.type}" id="${field.name}" name="${field.name}" ${required} ${placeholder} />
        </div>`;
    
    case 'textarea':
      return `
        <div class="form-group">
          <label for="${field.name}">${field.label} ${field.required ? '*' : ''}</label>
          <textarea id="${field.name}" name="${field.name}" ${required} ${placeholder}></textarea>
        </div>`;
    
    case 'select':
      let options = '<option value="">Select an option</option>';
      field.options.forEach(option => {
        options += `<option value="${option.value}">${option.label}</option>`;
      });
      return `
        <div class="form-group">
          <label for="${field.name}">${field.label} ${field.required ? '*' : ''}</label>
          <select id="${field.name}" name="${field.name}" ${required}>
            ${options}
          </select>
        </div>`;
    
    case 'radio':
      let radioOptions = '';
      field.options.forEach(option => {
        radioOptions += `
          <label class="radio-option">
            <input type="radio" name="${field.name}" value="${option.value}" ${required} />
            ${option.label}
          </label>`;
      });
      return `
        <div class="form-group">
          <label>${field.label} ${field.required ? '*' : ''}</label>
          <div class="radio-group">${radioOptions}</div>
        </div>`;
    
    case 'checkbox':
      return `
        <div class="form-group">
          <label class="checkbox-option">
            <input type="checkbox" id="${field.name}" name="${field.name}" />
            ${field.label}
          </label>
        </div>`;
    
    default:
      return '';
  }
}

function generateFormCSS(theme) {
  const themes = {
    default: `
      .dynamic-form {
        max-width: 500px;
        margin: 0 auto;
        padding: 20px;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      .form-group {
        margin-bottom: 20px;
      }
      label {
        display: block;
        margin-bottom: 5px;
        font-weight: 500;
        color: #333;
      }
      input, select, textarea {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }
      .submit-btn {
        width: 100%;
        padding: 12px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
      }
      .submit-btn:hover {
        background: #0056b3;
      }
    `,
    modern: `
      .dynamic-form {
        max-width: 500px;
        margin: 0 auto;
        padding: 30px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 15px;
        color: white;
      }
      .form-group {
        margin-bottom: 25px;
      }
      label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
        color: white;
      }
      input, select, textarea {
        width: 100%;
        padding: 15px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        background: rgba(255,255,255,0.9);
      }
      .submit-btn {
        width: 100%;
        padding: 15px;
        background: #ff6b6b;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s;
      }
      .submit-btn:hover {
        transform: translateY(-2px);
      }
    `
  };
  
  return themes[theme] || themes.default;
}

function generateFormJS(templateId, companyId) {
  return `
    document.getElementById('dynamicForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const data = {};
      
      // Collect form data
      for (let [key, value] of formData.entries()) {
        data[key] = value;
      }
      
      // Add required fields
      data.templateId = '${templateId}';
      data.companyId = '${companyId}';
      data.apiKey = 'YOUR_API_KEY_HERE';
      data.source = 'dynamic_form';
      
      try {
        const response = await fetch('http://localhost:8080/api/webhooks/leads/dynamic', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
          alert('Thank you! We will contact you soon.');
          this.reset();
        } else {
          alert('Error: ' + result.message);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Something went wrong. Please try again.');
      }
    });
  `;
}

module.exports = router;
