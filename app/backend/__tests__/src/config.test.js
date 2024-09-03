// +------------------------------------------------+
// |       CONFIGURATION VARIABLES TESTING          |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This test suite is designed to validate the configuration 
    variables used throughout the RedTetris backend application. 
    These tests ensure that the essential configuration variables 
    are defined, not null, and not empty, providing a basic check 
    to prevent runtime errors related to missing or incorrect 
    environment configurations.

    Test Suites:
    
    1. Configuration Existence:
       - Verifies that the configuration module is defined, 
         not null, and not an empty string.

    2. Hostname Validation:
       - Ensures that the `hostname` variable is correctly defined
         and initialized.

    3. Local Hostname Validation:
       - Ensures that the `hostname_local` variable is correctly 
         defined and initialized.

    4. Port Validation:
       - Checks that the `port` variable is correctly defined 
         and initialized.

    5. Session Secret Validation:
       - Ensures that the `session_secret` variable is correctly 
         defined and initialized.

    6. React URL Validation:
       - Validates that the `react_url` variable is correctly 
         defined and initialized.
*/

// +------------------- REQUIREMENTS ------------------+

const config = require('@root/config');

// +-------------------- TESTS ------------------------+

describe('Configuration Variables', () => {
    
    it('should be defined, not null nor empty', () => {
        expect(config).toBeDefined();
        expect(config).not.toBeNull();
        expect(config).not.toBe('');
    });

    it('should have a defined hostname', () => {
        expect(config.hostname).toBeDefined();
        expect(config.hostname).not.toBeNull();
        expect(config.hostname).not.toBe('');
    });

    it('should have a defined hostname_local', () => {
        expect(config.hostname_local).toBeDefined();
        expect(config.hostname_local).not.toBeNull();
        expect(config.hostname_local).not.toBe('');
    });

    it('should have a defined port', () => {
        expect(config.port).toBeDefined();
        expect(config.port).not.toBeNull();
        expect(config.port).not.toBe('');
    });

    it('should have a defined session_secret', () => {
        expect(config.session_secret).toBeDefined();
        expect(config.session_secret).not.toBeNull();
        expect(config.session_secret).not.toBe('');
    });

    it('should have a defined react_url', () => {
        expect(config.react_url).toBeDefined();
        expect(config.react_url).not.toBeNull();
        expect(config.react_url).not.toBe('');
    });
});
