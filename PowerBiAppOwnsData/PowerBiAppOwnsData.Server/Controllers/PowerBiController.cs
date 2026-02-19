using Microsoft.AspNetCore.Mvc;
using PowerBiAppOwnsData.Server.Services;

namespace PowerBiAppOwnsData.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PowerBiController : ControllerBase
    {
        private readonly PowerBiService _powerBiService;

        public PowerBiController(PowerBiService powerBiService)
        {
            _powerBiService = powerBiService;
        }

        [HttpGet("token")]
        public async Task<IActionResult> GetToken()
        {
            try
            {
                var result = await _powerBiService.GetEmbedTokenAsync();
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, ex.Message);
            }
        }
    }
}