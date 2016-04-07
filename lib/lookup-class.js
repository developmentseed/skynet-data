var hex = require('rgb-hex')

module.exports = createClassLookup

// given an array of class descriptors, return a (r, g, b) => index lookup
// function where `index` is the 0-based numerical index of the class with the
// given color.
// assumes #000000 represents unlabeled, and treats it as the 0th class
function createClassLookup (classData) {
  var classes = ['000000'].concat(classData.map((x) => x.color.slice(1)))
  return (r, g, b) => classes.indexOf(hex(r, g, b))
}
