require("ts-node").register({ transpileOnly: true });

const { setup } = require("./globalTestSetup");

module.exports = async function () {
    await setup();
    return null;
};
