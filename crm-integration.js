// CRM Integration Script
// Add this to your existing forms to capture leads in your CRM

// Configuration - Replace with your actual values
const CRM_CONFIG = {
    apiUrl: "http://localhost:8080/api/webhooks/leads",
    companyId: "YOUR_COMPANY_ID_HERE", // Replace with your actual company ID
    apiKey: "YOUR_WEBHOOK_API_KEY_HERE", // Replace with your actual API key
    source: "website" // Change based on your source
};

/**
 * Submit lead to CRM
 * @param {Object} leadData - Lead information
 * @param {string} leadData.name - Lead name
 * @param {string} leadData.email - Lead email
 * @param {string} leadData.phone - Lead phone number
 * @param {string} leadData.projectName - Project name
 * @param {string} leadData.source - Lead source
 * @returns {Promise<boolean>} - Success status
 */
async function submitToCRM(leadData) {
    try {
        const crmData = {
            name: leadData.name,
            email: leadData.email,
            phone: leadData.phone,
            companyId: CRM_CONFIG.companyId,
            source: leadData.source || CRM_CONFIG.source,
            projectName: leadData.projectName,
            apiKey: CRM_CONFIG.apiKey
        };

        const response = await fetch(CRM_CONFIG.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(crmData)
        });

        const result = await response.json();
        
        if (result.success) {
            console.log("Lead saved to CRM successfully:", result.leadId);
            return true;
        } else {
            console.error("CRM error:", result.message);
            return false;
        }
    } catch (error) {
        console.error("CRM submission error:", error);
        return false;
    }
}

/**
 * Enhanced form submission that sends to both email and CRM
 * @param {string} name - Lead name
 * @param {string} email - Lead email
 * @param {string} phone - Lead phone
 * @param {string} projectName - Project name (for both email and CRM)
 * @param {string} countryCode - Country code (for email)
 * @param {string} source - Lead source (for CRM)
 * @returns {Promise<boolean>} - Success status
 */
async function submitFormWithCRM(name, email, phone, projectName = "Sobha Properties", countryCode = '+91', source = "website") {
    try {
        // Submit to both email and CRM simultaneously
        const [emailResult, crmResult] = await Promise.allSettled([
            // Your existing email submission
            submitForm(name, email, phone, projectName, countryCode),
            // New CRM submission
            submitToCRM({
                name,
                email,
                phone,
                projectName,
                source
            })
        ]);

        const emailSuccess = emailResult.status === 'fulfilled' && emailResult.value;
        const crmSuccess = crmResult.status === 'fulfilled' && crmResult.value;

        // Log results
        console.log("Email submission:", emailSuccess ? "Success" : "Failed");
        console.log("CRM submission:", crmSuccess ? "Success" : "Failed");

        // Return true if at least one submission succeeded
        return emailSuccess || crmSuccess;

    } catch (error) {
        console.error("Dual submission error:", error);
        return false;
    }
}

// Modified versions of your existing functions
async function submitBtn1(e, projectName) {
    e.preventDefault();
    console.log(projectName);

    const submitBtn_1 = document.getElementById("submitBtn_1");
    const name = document.getElementById("name_1").value;
    const email = document.getElementById("email_1").value;
    const number = document.getElementById("number_1").value;
    const countryCode = document.getElementById("country_code_1").value;

    try {
        submitBtn_1.innerText = "Submitting...";
        if (validateForm(name, email, number)) {
            // Use the enhanced submission function
            const isSuccess = await submitFormWithCRM(name, email, number, projectName, countryCode, "website");
            if (isSuccess) {
                document.getElementById("name_1").value = "";
                document.getElementById("email_1").value = "";
                document.getElementById("number_1").value = "";
                closeModel();
            }
        }
    } catch (error) {
        console.error("Submission error:", error);
    } finally {
        submitBtn_1.innerText = "Submit";
    }
}

async function submitBtn2(e, projectName) {
    e.preventDefault();
    const submitBtn_2 = document.getElementById("submitBtn_2");
    const name = document.getElementById("name_2").value;
    const email = document.getElementById("email_2").value;
    const number = document.getElementById("number_2").value;
    const countryCode = document.getElementById("country_code_2").value;

    try {
        submitBtn_2.innerText = "Submitting...";
        if (validateForm(name, email, number)) {
            const isSuccess = await submitFormWithCRM(name, email, number, projectName, countryCode, "website");
            if (isSuccess) {
                document.getElementById("name_2").value = "";
                document.getElementById("email_2").value = "";
                document.getElementById("number_2").value = "";
            }
        }
    } catch (error) {
        console.error("Submission error:", error);
    } finally {
        submitBtn_2.innerText = "Submit";
    }
}

async function submitBtn3(e, projectName) {
    e.preventDefault();
    const submitBtn_3 = document.getElementById("submitBtn_3");
    const name = document.getElementById("name_3").value;
    const email = document.getElementById("email_3").value;
    const number = document.getElementById("number_3").value;
    
    try {
        submitBtn_3.innerText = "Downloading...";
        if (validateForm(name, email, number)) {
            const isSuccess = await submitFormWithCRM(name, email, number, projectName, '+91', "brochure_download");
            if (isSuccess) {
                document.getElementById("name_3").value = "";
                document.getElementById("email_3").value = "";
                document.getElementById("number_3").value = "";
            }
        }
    } catch (error) {
        console.error("Submission error:", error);
    } finally {
        submitBtn_3.innerText = "Download";
    }
}

async function submitBtn4(e, projectName) {
    e.preventDefault();
    const submitBtn_4 = document.getElementById("submitBtn_4");
    const name = document.getElementById("name_4").value;
    const email = document.getElementById("email_4").value;
    const number = document.getElementById("number_4").value;
    
    try {
        submitBtn_4.innerText = "Downloading...";
        if (validateForm(name, email, number)) {
            const isSuccess = await submitFormWithCRM(name, email, number, projectName, '+91', "cost_sheet_download");
            if (isSuccess) {
                document.getElementById("name_4").value = "";
                document.getElementById("email_4").value = "";
                document.getElementById("number_4").value = "";
            }
        }
    } catch (error) {
        console.error("Submission error:", error);
    } finally {
        submitBtn_4.innerText = "Download";
    }
}

// Utility function to add CRM integration to any form
function addCRMIntegration(formId, source = "website") {
    const form = document.getElementById(formId);
    if (!form) {
        console.error(`Form with ID ${formId} not found`);
        return;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const leadData = {
            name: formData.get('name') || formData.get('fullName'),
            email: formData.get('email'),
            phone: formData.get('phone') || formData.get('number'),
            projectName: formData.get('projectName') || "Sobha Properties",
            source: source
        };

        try {
            const success = await submitToCRM(leadData);
            if (success) {
                console.log("Lead captured in CRM successfully");
            }
        } catch (error) {
            console.error("CRM integration error:", error);
        }
    });
}

// Example usage:
// addCRMIntegration('myForm', 'landing_page');