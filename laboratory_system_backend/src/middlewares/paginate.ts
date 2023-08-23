export default function paginate(req, res, next) {
  const page = parseInt(req.query.page, 10) || 1
  const limit = parseInt(req.query.limit, 10) || 10

  const startIndex = (page - 1) * limit
  const endIndex = page * limit
  const total = res.locals.total
  const totalPages = Math.ceil(total / limit)

  res.locals.pagination = {
    page,
    limit,
    startIndex,
    endIndex,
    total,
    totalPages
  }

  next()
}
