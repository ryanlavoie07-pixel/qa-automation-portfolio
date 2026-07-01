QA Automation Framework: Secure Portal 🧪📌 Project OverviewThis repository contains a robust, automated End-to-End (E2E) testing framework built with Playwright and JavaScript.It was designed to test a modern web application ("Secure Portal") integrated with a cloud backend (Supabase), focusing on complex user lifecycles, file handling, and negative path validations.🎯 Key Features & Testing ScopeE2E User Lifecycle: Automates the complete flow from account creation, dynamic login, and profile modification to secure logout and permanent account deletion.Cloud Storage Integrations: Validates programmatic file uploads (.png avatars, .pdf documents) bypassing hidden system file-choosers.Negative Testing & Edge Cases: Robust handling of Race Conditions, UI alerts, mismatched credentials, and backend network rejections (e.g., invalid email formats).Dialog & Alert Handling: Custom logic to intercept, validate, and dismiss native browser window.confirm and alert prompts.Automated Artifacts: Configured to generate HTML reports, video recordings, and interaction traces for visual debugging.📁 Repository Structure├── tests/
│   ├── TestfileUploads.spec.js      # Cloud storage upload validations
│   ├── mismatched-passwords.spec.js # Negative testing (Validation & Alerts)
│   ├── codegen-delete.spec.js       # Account deletion and DB teardown
│   └── test-assets/                 # Dummy PNG and PDF files for upload testing
├── playwright.config.js             # Playwright configuration (Traces, Video, Reporters)
└── README.md                        # Project documentation
🚀 How to Run the Tests LocallyClone the repository:git clone [https://github.com/ryanlavoie07-pixel/qa-automation-portfolio.git](https://github.com/ryanlavoie07-pixel/qa-automation-portfolio.git)
cd qa-automation-portfolio
Install dependencies:npm install
npx playwright install
Run the test suite:npx playwright test
View the interactive HTML Report (includes Videos & Traces):npx playwright show-report
🧠 Technical Highlights for ReviewersRace Condition Mitigation: Utilized page.waitForEvent('dialog') rather than .once() to strictly synchronize Playwright with backend Supabase network resolutions.Dynamic File Resolution: Leveraged Playwright's testInfo to dynamically map relative file paths for CI/CD compatible file-upload testing.Test Isolation: Ensured safe database teardown and state resets using automated UI flows.Created by Ryan Lavoie as a demonstration of modern QA Automation practices.