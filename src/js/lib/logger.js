const logger = data => {
    if (LOCALISED_VARS && LOCALISED_VARS.env !== 'production') {
        console.log(data); // eslint-disable-line no-console
    } else {
        // TODO - production logger
    }
};

export default logger;
