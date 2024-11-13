module.exports.getMinutesAgo = (timestamp) => {
  return Math.floor((Date.now() - timestamp) / (1000 * 60));
};
