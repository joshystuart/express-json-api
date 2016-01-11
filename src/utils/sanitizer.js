import filters from 'xss-filters';

export default {
    sanitize: filters.inHTMLData
};
