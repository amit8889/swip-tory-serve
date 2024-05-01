const { default: mongoose } = require("mongoose")

async function connect_db(){
     try {
         await mongoose.connect(process.env.DB_URL);
         console.log("=======Data base connected successfulyy=========")
     } catch (error) {       
        console.log(error)
        setTimeout(
            connect_db,5000)
     }
}
module.exports = connect_db