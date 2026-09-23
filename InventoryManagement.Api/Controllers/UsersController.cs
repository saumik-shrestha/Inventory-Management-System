using InventoryManagement.Api.Data;
using InventoryManagement.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "admin")]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ========================================
        // GET: api/Users
        // ADMIN ONLY
        // ========================================

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .OrderBy(u => u.FullName)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Username,
                    u.Email,
                    u.Role,
                    u.CreatedAt
                })
                .ToListAsync();

            return Ok(users);
        }

        // ========================================
        // GET: api/Users/{id}
        // ADMIN ONLY
        // ========================================

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _context.Users
                .Where(u => u.Id == id)
                .Select(u => new
                {
                    u.Id,
                    u.FullName,
                    u.Username,
                    u.Email,
                    u.Role,
                    u.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found."
                });
            }

            return Ok(user);
        }

        // ========================================
        // POST: api/Users
        // ADMIN ONLY
        // ========================================

        [HttpPost]
        public async Task<IActionResult> CreateUser(User user)
        {
            // Validate full name
            if (string.IsNullOrWhiteSpace(user.FullName))
            {
                return BadRequest(new
                {
                    message = "Full name is required."
                });
            }

            // Validate username
            if (string.IsNullOrWhiteSpace(user.Username))
            {
                return BadRequest(new
                {
                    message = "Username is required."
                });
            }

            // Validate email
            if (string.IsNullOrWhiteSpace(user.Email))
            {
                return BadRequest(new
                {
                    message = "Email is required."
                });
            }

            // Validate password
            if (string.IsNullOrWhiteSpace(user.PasswordHash))
            {
                return BadRequest(new
                {
                    message = "Password is required."
                });
            }

            // Check duplicate username
            var usernameExists = await _context.Users
                .AnyAsync(u =>
                    u.Username.ToLower() ==
                    user.Username.Trim().ToLower());

            if (usernameExists)
            {
                return Conflict(new
                {
                    message = "Username already exists."
                });
            }

            // Check duplicate email
            var emailExists = await _context.Users
                .AnyAsync(u =>
                    u.Email.ToLower() ==
                    user.Email.Trim().ToLower());

            if (emailExists)
            {
                return Conflict(new
                {
                    message = "Email already exists."
                });
            }

            // Default role
            if (string.IsNullOrWhiteSpace(user.Role))
            {
                user.Role = "staff";
            }

            user.Role = user.Role.Trim().ToLower();

            // Only admin or staff
            if (user.Role != "admin" && user.Role != "staff")
            {
                return BadRequest(new
                {
                    message = "Role must be admin or staff."
                });
            }

            // ========================================
            // HASH PASSWORD BEFORE SAVING
            // ========================================

            user.PasswordHash =
                BCrypt.Net.BCrypt.HashPassword(
                    user.PasswordHash);

            // Generate ID and creation date
            user.Id = 0;
            user.CreatedAt = DateTime.UtcNow;

            // Save user
            _context.Users.Add(user);

            await _context.SaveChangesAsync();

            // Never return PasswordHash
            return CreatedAtAction(
                nameof(GetUser),
                new { id = user.Id },
                new
                {
                    user.Id,
                    user.FullName,
                    user.Username,
                    user.Email,
                    user.Role,
                    user.CreatedAt
                }
            );
        }

        // ========================================
        // PUT: api/Users/{id}
        // ADMIN ONLY
        // ========================================

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(
            int id,
            User updatedUser)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found."
                });
            }

            // Validate full name
            if (string.IsNullOrWhiteSpace(updatedUser.FullName))
            {
                return BadRequest(new
                {
                    message = "Full name is required."
                });
            }

            // Validate username
            if (string.IsNullOrWhiteSpace(updatedUser.Username))
            {
                return BadRequest(new
                {
                    message = "Username is required."
                });
            }

            // Validate email
            if (string.IsNullOrWhiteSpace(updatedUser.Email))
            {
                return BadRequest(new
                {
                    message = "Email is required."
                });
            }

            // Check duplicate username
            var duplicateUsername = await _context.Users
                .AnyAsync(u =>
                    u.Id != id &&
                    u.Username.ToLower() ==
                    updatedUser.Username.Trim().ToLower());

            if (duplicateUsername)
            {
                return Conflict(new
                {
                    message =
                        "Another user with this username already exists."
                });
            }

            // Check duplicate email
            var duplicateEmail = await _context.Users
                .AnyAsync(u =>
                    u.Id != id &&
                    u.Email.ToLower() ==
                    updatedUser.Email.Trim().ToLower());

            if (duplicateEmail)
            {
                return Conflict(new
                {
                    message =
                        "Another user with this email already exists."
                });
            }

            // Validate role
            var role =
                string.IsNullOrWhiteSpace(updatedUser.Role)
                ? "staff"
                : updatedUser.Role.Trim().ToLower();

            if (role != "admin" && role != "staff")
            {
                return BadRequest(new
                {
                    message = "Role must be admin or staff."
                });
            }

            // Update user information
            user.FullName =
                updatedUser.FullName.Trim();

            user.Username =
                updatedUser.Username.Trim();

            user.Email =
                updatedUser.Email.Trim();

            user.Role = role;

            // ========================================
            // UPDATE PASSWORD ONLY IF PROVIDED
            // ========================================

            if (!string.IsNullOrWhiteSpace(
                updatedUser.PasswordHash))
            {
                user.PasswordHash =
                    BCrypt.Net.BCrypt.HashPassword(
                        updatedUser.PasswordHash);
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "User updated successfully.",

                user = new
                {
                    user.Id,
                    user.FullName,
                    user.Username,
                    user.Email,
                    user.Role,
                    user.CreatedAt
                }
            });
        }

        // ========================================
        // DELETE: api/Users/{id}
        // ADMIN ONLY
        // ========================================

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found."
                });
            }

            _context.Users.Remove(user);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "User deleted successfully."
            });
        }
    }
}