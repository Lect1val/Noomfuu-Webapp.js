const { db } = require("../Database/database");

const getContactList = async (req, res) => {
  try {
    const contactListRef = db.collection("User");
    const contactlists = [];

    await contactListRef.get().then((snapshot) => {
      snapshot.forEach((doc) => {
        contactlists.push({
          nickName: doc.data().nickName,
        });
      });
    });
    console.log(contactlists[0]);
    res.json(contactlists);

    // JSON.stringify(contactlists);
  } catch (error) {
    console.log(error);
  }
};

module.exports = { getContactList };
