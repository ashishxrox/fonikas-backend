exports.news = async(req, res)=>{

    try{
        const apiKey = process.env.NEWS_API_KEY;
        const response = await fetch(
            `https://newsapi.org/v2/everything?q=finance&apiKey=${apiKey}`
        );
        const data = await response.json();
        res.json(data);
    }catch (error) {
        res.status(500).json({ message: "Something went wrong", error: error });
      }

   
}
