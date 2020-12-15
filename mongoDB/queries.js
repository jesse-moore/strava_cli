// const dayjs = require('dayjs');
// const Activity = require('./models/activity');
// const mongoose = require('mongoose');

// const getActivities = async ({ year, month, page, perPage }) => {
//     const result = []
//     try {
//         await connectMongoose()
//         const activities = await findActivities({
//             page,
//             perPage,
//             month,
//             year,
//         })
//         result.push(...activities)
//         await closeMongoose()
//         return result
//     } catch (error) {
//         throw new Error(error.message)
//     }
// }

// const getActivityByID = async ({ id }) => {
//     try {
//         await connectMongoose()
//         const activity = await findActivityByID(id)
//         await closeMongoose()
//         return activity
//     } catch (error) {
//         throw new Error(error.message)
//     }
// }

// const findActivityByID = async (id) => {
//     try {
//         return await Activity.findById(id);
//     } catch (error) {
//         if (error.name === 'CastError') throw Error('Invalid ID');
//         throw Error(error.message);
//     }
// };
// const findActivities = async ({ page = 0, perPage = 30, year, month }) => {
//     try {
//         const perPageLimited = perPage > 50 ? 50 : perPage;
//         const skip = page * perPage;

//         const args = {};
//         if (year) args.year = year;
//         if (year && month) args.month = month;
//         return await Activity.find(args).skip(skip).limit(perPageLimited);
//     } catch (error) {
//         throw Error(error.message);
//     }
// };

// async function updateActivities() {
//     try {
//         await connectMongoose();
//         const docs = await Activity.find();
//         const updates = docs.map(async (doc) => {
//             const start_date = dayjs(doc.toObject().start_date).toISOString();
//             const start_date_local = dayjs(
//                 doc.toObject().start_date
//             ).toISOString();
//             return doc.updateOne({ $set: { start_date, start_date_local } });
//         });
//         await Promise.all(updates);
//         await closeMongoose();
//         return;
//     } catch (error) {
//         throw Error(error.message);
//     }
// }

// const renameCollection = async () => {
//     try {
//         await connectMongoose();
//         const name = await mongoose.connection.db
//             .collection('entries')
//             .rename('activities', { dropTarget: true });
//         console.log(name);
//         await closeMongoose();
//     } catch (error) {
//         console.log(error);
//     }
// };

// module.exports = { findActivities, findActivityByID, renameCollection };
