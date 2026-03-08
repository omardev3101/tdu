module.exports = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Nível de acesso não identificado.' });
    }

    const userRole = req.user.role.toUpperCase();
    
    // Verifica se o cargo do usuário está na lista permitida
    const hasPermission = allowedRoles.some(role => role.toUpperCase() === userRole);

    if (!hasPermission) {
      return res.status(403).json({ 
        error: `Acesso negado. Esta função é restrita a: ${allowedRoles.join(', ')}` 
      });
    }

    return next();
  };
};