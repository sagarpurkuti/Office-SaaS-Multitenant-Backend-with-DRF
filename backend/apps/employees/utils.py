def get_employee_for_user(user):
    """
    Employee record linked to a login, or None.

    `user.employee` is a reverse one-to-one, so touching it raises
    RelatedObjectDoesNotExist when no record exists. That exception also
    subclasses AttributeError, which is what makes the getattr default work.
    """
    if not user or not user.is_authenticated:
        return None
    return getattr(user, 'employee', None)
