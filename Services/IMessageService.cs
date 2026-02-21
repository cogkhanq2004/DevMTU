using Microsoft.AspNetCore.Http;

namespace MTU.Services
{
    public interface IMessageService
    {
        Task<(bool Success, string? ErrorMessage, object? MessageData)> SendMessageAsync(
            int senderId,
            int receiverId,
            string content,
            IFormFile? image);
    }
}
