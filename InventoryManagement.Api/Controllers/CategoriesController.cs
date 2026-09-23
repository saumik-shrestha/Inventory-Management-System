using InventoryManagement.Api.Data;
using InventoryManagement.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CategoriesController(ApplicationDbContext context)
        {
            _context = context;
        }

        // ========================================
        // GET ALL CATEGORIES
        // ADMIN + STAFF
        // ========================================

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.Categories
                .OrderBy(c => c.Name)
                .ToListAsync();

            return Ok(categories);
        }


        // ========================================
        // GET CATEGORY BY ID
        // ADMIN + STAFF
        // ========================================

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetCategory(int id)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return NotFound(new
                {
                    message = "Category not found."
                });
            }

            return Ok(category);
        }


        // ========================================
        // CREATE CATEGORY
        // ADMIN ONLY
        // ========================================

        [HttpPost]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> CreateCategory(Category category)
        {
            if (string.IsNullOrWhiteSpace(category.Name))
            {
                return BadRequest(new
                {
                    message = "Category name is required."
                });
            }

            bool exists = await _context.Categories
                .AnyAsync(c =>
                    c.Name.ToLower() == category.Name.ToLower());

            if (exists)
            {
                return Conflict(new
                {
                    message = "Category already exists."
                });
            }

            category.Id = 0;
            category.CreatedAt = DateTime.UtcNow;

            _context.Categories.Add(category);

            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetCategory),
                new { id = category.Id },
                category
            );
        }


        // ========================================
        // UPDATE CATEGORY
        // ADMIN ONLY
        // ========================================

        [HttpPut("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateCategory(
            int id,
            Category updatedCategory)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return NotFound(new
                {
                    message = "Category not found."
                });
            }

            if (string.IsNullOrWhiteSpace(updatedCategory.Name))
            {
                return BadRequest(new
                {
                    message = "Category name is required."
                });
            }

            bool duplicate = await _context.Categories
                .AnyAsync(c =>
                    c.Id != id &&
                    c.Name.ToLower() ==
                    updatedCategory.Name.ToLower());

            if (duplicate)
            {
                return Conflict(new
                {
                    message =
                        "Another category with this name already exists."
                });
            }

            category.Name = updatedCategory.Name;
            category.Description = updatedCategory.Description;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Category updated successfully.",
                category
            });
        }


        // ========================================
        // DELETE CATEGORY
        // ADMIN ONLY
        // ========================================

        [HttpDelete("{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return NotFound(new
                {
                    message = "Category not found."
                });
            }

            bool hasEquipment = await _context.Equipment
                .AnyAsync(e => e.CategoryId == id);

            if (hasEquipment)
            {
                return BadRequest(new
                {
                    message =
                        "Cannot delete this category because equipment is assigned to it."
                });
            }

            _context.Categories.Remove(category);

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Category deleted successfully."
            });
        }
    }
}