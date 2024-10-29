// option 01

const asyncHandler =(reqHandler)=>{
    return (req, res, next) =>{
        Promise.resolve(reqHandler(req,res,next)).catch((err) => next(err))
    }
}

export {asyncHandler}




// if you want to use option 02 you can commentout the option 01 exept "export-line" 
// option 02
// const asyncHandler = (fn)=> async()=> { 
//     try {
//         await fn(req, res, next)
        
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: error.message || 'Internal Server Error'
//         })
        
//     }

// }