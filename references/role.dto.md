public record CreateRoleRequest(
    [Required(AllowEmptyStrings = false)]
    [StringLength(50, MinimumLength = 3)]
    string Name,

    [StringLength(250)]
    string? Description,

    [Required]
    IEnumerable<Guid> PermissionIds
);

public record UpdateRoleRequest(
    [StringLength(50, MinimumLength = 3)]
    string? Name,

    [StringLength(250)]
    string? Description,

    [Required]
    IEnumerable<Guid> PermissionIds
);


public record AssignPermissionsRequest(
    [Required]
    IEnumerable<Guid> PermissionIds // Removed MinLength to allow clearing
);

public record RoleDto(
    Guid Id,
    string Name,
    string? Description,
    IEnumerable<PermissionDto> Permissions,
    DateTime CreatedAt,
    DateTime UpdatedAt
);
