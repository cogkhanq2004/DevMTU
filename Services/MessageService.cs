using Microsoft.AspNetCore.SignalR;
using MTU.Data;
using MTU.Hubs;
using MTU.Models.Entities;

namespace MTU.Services
{
    public class MessageService : IMessageService
    {
        private readonly MTUSocialDbContext _context;
        private readonly IHubContext<ChatHub> _hubContext;

        public MessageService(MTUSocialDbContext context, IHubContext<ChatHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        public async Task<(bool Success, string? ErrorMessage, object? MessageData)> SendMessageAsync(
            int senderId,
            int receiverId,
            string content,
            IFormFile? image)
        {
            string? imageUrl = null;

            if (image != null && image.Length > 0)
            {
                var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif" };
                if (!allowedTypes.Contains(image.ContentType.ToLower()))
                    return (false, "Chỉ chấp nhận file ảnh", null);

                if (image.Length > 5 * 1024 * 1024)
                    return (false, "Ảnh không được vượt quá 5MB", null);

                var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "messages");
                if (!Directory.Exists(uploadsFolder))
                    Directory.CreateDirectory(uploadsFolder);

                var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                using (var stream = new FileStream(filePath, FileMode.Create))
                    await image.CopyToAsync(stream);

                imageUrl = $"/uploads/messages/{fileName}";
            }

            var trimmedContent = content?.Trim() ?? "";
            if (string.IsNullOrEmpty(trimmedContent) && string.IsNullOrEmpty(imageUrl))
                return (false, "Nội dung không được để trống", null);

            if (string.IsNullOrEmpty(trimmedContent) && !string.IsNullOrEmpty(imageUrl))
                trimmedContent = "[Hình ảnh]";

            var message = new Message
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Content = trimmedContent,
                ImageUrl = imageUrl,
                CreatedAt = DateTime.Now,
                IsRead = false,
                IsDeleted = false
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            var senderUser = await _context.Users.FindAsync(senderId);
            var senderAvatar = senderUser?.Avatar ?? "/assets/user.png";

            var messageData = new
            {
                id = message.MessageId,
                senderId = message.SenderId,
                receiverId = message.ReceiverId,
                content = message.Content,
                imageUrl = message.ImageUrl,
                time = message.CreatedAt.ToString("HH:mm"),
                date = message.CreatedAt.ToString("dd/MM/yyyy"),
                senderAvatar
            };

            await _hubContext.Clients
                .Group($"user_{receiverId}")
                .SendAsync("ReceiveMessage", messageData);

            return (true, null, new
            {
                id = message.MessageId,
                content = message.Content,
                imageUrl = message.ImageUrl,
                time = message.CreatedAt.ToString("HH:mm")
            });
        }
    }
}
