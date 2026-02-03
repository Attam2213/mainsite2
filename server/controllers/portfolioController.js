const {Portfolio} = require('../models');
const ApiError = require('../error/ApiError');

class PortfolioController {
    async create(req, res, next) {
        try {
            const {title, description, link} = req.body;
            let fileName = null;
            if (req.file) {
                fileName = req.file.filename;
            }
            
            const portfolio = await Portfolio.create({title, description, link, image: fileName});
            return res.json(portfolio);
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async getAll(req, res) {
        const portfolios = await Portfolio.findAll();
        return res.json(portfolios);
    }
    
    async delete(req, res) {
        const {id} = req.params;
        const portfolio = await Portfolio.destroy({where: {id}});
        return res.json(portfolio);
    }
}

module.exports = new PortfolioController();
