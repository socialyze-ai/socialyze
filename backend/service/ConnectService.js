// Define multiple functions
function greet(name) {
    return `Hello, ${name}!`;
}
  
function updateAccessInfoFacebook (newAccessInfo, oldAccessInfo) {
    // Create a new object to store the merged result
    const updatedAccessInfo = { ...newAccessInfo };

    // Iterate through values in the second JSON
    for (const pageOld of oldAccessInfo.pageList) {
        // Check if the item already exists in the updatedAccessInfo
        const existingPage = updatedAccessInfo.pageList.find((pageNew) => pageNew.id === pageOld.id);

        // If the item doesn't exist, add it to the updatedAccessInfo.values
        if (!existingPage) {
            updatedAccessInfo.pageList.push(pageOld);
        } 
    }
  return updatedAccessInfo;
    
}

function updateAccessInfoInstagram (newAccessInfo, oldAccessInfo) {
    // Create a new object to store the merged result
    const updatedAccessInfo = { ...newAccessInfo };

    // Iterate through values in the second JSON
    for (const pageOld of oldAccessInfo.pageList) {
        // Check if the item already exists in the updatedAccessInfo
        const existingPage = updatedAccessInfo.pageList.find((pageNew) => pageNew.id === pageOld.id);

        // If the item doesn't exist, add it to the updatedAccessInfo.values
        if (!existingPage) {
            updatedAccessInfo.pageList.push(pageOld);
        } 
    }

    // Iterate through values in the second JSON
    for (const pageOld of oldAccessInfo.instaPageList) {
        // Check if the item already exists in the updatedAccessInfo
        const existingPage = updatedAccessInfo.instaPageList.find((pageNew) => pageNew.id === pageOld.id);

        // If the item doesn't exist, add it to the updatedAccessInfo.values
        if (!existingPage) {
            updatedAccessInfo.instaPageList.push(pageOld);
        } 
    }
  return updatedAccessInfo;
    
}

module.exports = {
    greet,
    updateAccessInfoFacebook,
    updateAccessInfoInstagram
};