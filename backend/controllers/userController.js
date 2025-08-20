exports.getUserProfile = (req, res) => {
  const { id, username, email, role } = req.user;
  res.json({ id, username, email, role });
};
