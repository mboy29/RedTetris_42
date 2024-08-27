// +------------------------------------------------+
// |      REDTETRIS CONFIGURATION AXIOS JS          |
// +------------------------------------------------+

// +------------------- SUMMARY --------------------+

/*
    This module configures Axios for the RedTetris frontend.
*/

// +----------------- REQUIREMENTS -----------------+

import axios from 'axios';
import config from './config';

// +----------------- CONFIGURATION ----------------+

axios.defaults.withCredentials = true;
axios.defaults.baseURL = config.api_url;

// +------------------- EXPORTS --------------------+

export default axios;