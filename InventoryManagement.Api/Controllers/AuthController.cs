using InventoryManagement.Api.Data;
using InventoryManagement.Api.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace InventoryManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(
            ApplicationDbContext context,
            IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        // POST: api/Auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto login)
        {
            // Validate username
            if (string.IsNullOrWhiteSpace(login.Username))
            {
                return BadRequest(new
                {
                    message = "Username is required."
                });
            }

            // Validate password
            if (string.IsNullOrWhiteSpace(login.Password))
            {
                return BadRequest(new
                {
                    message = "Password is required."
                });
            }

            // Find user
            var user = await _context.Users
                .FirstOrDefaultAsync(u =>
                    u.Username.ToLower() ==
                    login.Username.Trim().ToLower());

            if (user == null)
            {
                return Unauthorized(new
                {
                    message = "Invalid username or password."
                });
            }

            // Check password
            bool passwordValid;

            try
            {
                passwordValid = BCrypt.Net.BCrypt.Verify(
                    login.Password,
                    user.PasswordHash);
            }
            catch
            {
                passwordValid = false;
            }

            if (!passwordValid)
            {
                return Unauthorized(new
                {
                    message = "Invalid username or password."
                });
            }

            // Validate role
            var role = user.Role?.Trim().ToLower();

            if (role != "admin" && role != "staff")
            {
                return Unauthorized(new
                {
                    message = "User has an invalid role."
                });
            }

            // Get JWT settings
            var jwtKey = _configuration["Jwt:Key"];
            var jwtIssuer = _configuration["Jwt:Issuer"];
            var jwtAudience = _configuration["Jwt:Audience"];

            if (string.IsNullOrWhiteSpace(jwtKey))
            {
                return StatusCode(500, new
                {
                    message = "JWT key is not configured."
                });
            }

            // Create claims
            var claims = new List<Claim>
            {
                new Claim(
                    ClaimTypes.NameIdentifier,
                    user.Id.ToString()),

                new Claim(
                    ClaimTypes.Name,
                    user.Username),

                new Claim(
                    ClaimTypes.Email,
                    user.Email),

                new Claim(
                    ClaimTypes.Role,
                    role)
            };

            // Create security key
            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey));

            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256);

            // Create token
            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(8),
                signingCredentials: credentials
            );

            var tokenString = new JwtSecurityTokenHandler()
                .WriteToken(token);

            // Return login response
            return Ok(new
            {
                message = "Login successful.",

                token = tokenString,

                user = new
                {
                    user.Id,
                    user.FullName,
                    user.Username,
                    user.Email,
                    Role = role
                }
            });
        }

        // TEMPORARY: Generate BCrypt password hash
        [HttpGet("hash")]
        public IActionResult GenerateHash(string password)
        {
            if (string.IsNullOrWhiteSpace(password))
            {
                return BadRequest(new
                {
                    message = "Password is required."
                });
            }

            var hash = BCrypt.Net.BCrypt.HashPassword(password);

            return Ok(new
            {
                password,
                hash
            });
        }
    }
}