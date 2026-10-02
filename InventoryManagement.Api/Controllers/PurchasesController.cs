using InventoryManagement.Api.DTOs;
using InventoryManagement.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InventoryManagement.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class PurchasesController : ControllerBase
{
    private readonly PurchaseService _purchaseService;

    public PurchasesController(
        PurchaseService purchaseService)
    {
        _purchaseService = purchaseService;
    }


    // ==========================================
    // GET ALL PURCHASES
    // ==========================================

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var purchases =
            await _purchaseService.GetAllAsync();

        return Ok(purchases);
    }


    // ==========================================
    // GET PURCHASE BY ID
    // ==========================================

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(
        int id)
    {
        var purchase =
            await _purchaseService.GetByIdAsync(id);

        if (purchase == null)
        {
            return NotFound(new
            {
                message = "Purchase not found."
            });
        }

        return Ok(purchase);
    }


    // ==========================================
    // CREATE PURCHASE
    // ==========================================

    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Create(
        CreatePurchaseDto dto)
    {
        try
        {
            var purchase =
                await _purchaseService.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = purchase.Id },
                purchase);
        }
        catch (Exception ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }
}