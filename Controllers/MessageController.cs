using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MTU.Data;
using MTU.Models.DTOs;
using MTU.Services;

namespace MTU.Controllers
{
    [Authorize]
    public class MessageController : Controller
    {
        private readonly MTUSocialDbContext _context;
        private readonly ILogger<MessageController> _logger;
        private readonly IMessageService _messageService;

        public MessageController(MTUSocialDbContext context, ILogger<MessageController> logger, IMessageService messageService)
        {
            _context = context;
            _logger = logger;
            _messageService = messageService;
        }

        /// <summary>
        /// Tin nhắn được nhận
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetRecentConversations()
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Json(new { success = false, conversations = new List<object>() });
                }

                var messages = await _context.Messages
                    .Where(m => (m.SenderId == userId || m.ReceiverId == userId) && !m.IsDeleted)
                    .OrderByDescending(m => m.CreatedAt)
                    .ToListAsync();

                var conversationPartners = messages
                    .Select(m => m.SenderId == userId ? m.ReceiverId : m.SenderId)
                    .Distinct()
                    .Take(10)
                    .ToList();

                var conversations = new List<object>();

                foreach (var partnerId in conversationPartners)
                {
                    var partner = await _context.Users.FindAsync(partnerId);
                    if (partner == null) continue;

                    var lastMessage = messages
                        .Where(m => (m.SenderId == partnerId && m.ReceiverId == userId) ||
                                   (m.SenderId == userId && m.ReceiverId == partnerId))
                        .OrderByDescending(m => m.CreatedAt)
                        .FirstOrDefault();

                    if (lastMessage == null) continue;

                    var unreadCount = messages
                        .Count(m => m.SenderId == partnerId && m.ReceiverId == userId && !m.IsRead);

                    var fullName = $"{partner.FirstName} {partner.LastName}".Trim();
                    if (string.IsNullOrWhiteSpace(fullName)) fullName = partner.Username;

                    conversations.Add(new
                    {
                        userId = partnerId,
                        name = fullName,
                        avatar = partner.Avatar ?? "/assets/user.png",
                        lastMessage = lastMessage.Content.Length > 50 
                            ? lastMessage.Content.Substring(0, 50) + "..." 
                            : lastMessage.Content,
                        timeAgo = GetTimeAgo(lastMessage.CreatedAt),
                        unread = unreadCount > 0
                    });
                }

                return Json(new { success = true, conversations });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting recent conversations");
                return Json(new { success = false, conversations = new List<object>() });
            }
        }

        /// <summary>
        /// Trang nhắn tin có thể là Messages
        /// </summary>
        [HttpGet]
        [Route("Messages")]
        public async Task<IActionResult> Index()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return RedirectToAction("Login", "Home");
            }

            var user = await _context.Users.FindAsync(userId);
            if (user != null)
            {
                ViewBag.CurrentUserAvatar = user.Avatar ?? "/assets/user.png";
                ViewBag.CurrentUserFullName = $"{user.FirstName} {user.LastName}".Trim();
            }
            
            ViewBag.CurrentUserId = userId;

            return View();
        }

        /// <summary>
        /// Trò chuyện với {user} hiện tại
        /// </summary>
        [HttpGet]
        [Route("Message/{userId:int}")]
        public async Task<IActionResult> Chat(int userId)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int currentUserId))
            {
                return RedirectToAction("Login", "Home");
            }

            var currentUser = await _context.Users.FindAsync(currentUserId);
            var chatPartner = await _context.Users.FindAsync(userId);

            if (chatPartner == null)
            {
                return NotFound();
            }

            ViewBag.CurrentUserId = currentUserId;
            ViewBag.CurrentUserAvatar = currentUser?.Avatar ?? "/assets/user.png";
            ViewBag.CurrentUserFullName = currentUser != null 
                ? $"{currentUser.FirstName} {currentUser.LastName}".Trim() 
                : "User";
            
            ViewBag.PartnerId = userId;
            ViewBag.PartnerAvatar = chatPartner.Avatar ?? "/assets/user.png";
            ViewBag.PartnerName = $"{chatPartner.FirstName} {chatPartner.LastName}".Trim();
            if (string.IsNullOrWhiteSpace(ViewBag.PartnerName))
                ViewBag.PartnerName = chatPartner.Username;

            return View("Chat");
        }

        /// <summary>
        /// Nhận tin nhắn giữa hai người dùng (user(1) and me)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetMessages(int partnerId)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                {
                    return Json(new { success = false });
                }

                var messages = await _context.Messages
                    .Where(m => ((m.SenderId == userId && m.ReceiverId == partnerId) ||
                                (m.SenderId == partnerId && m.ReceiverId == userId)) && !m.IsDeleted)
                    .OrderBy(m => m.CreatedAt)
                    .Select(m => new
                    {
                        id = m.MessageId,
                        content = m.Content,
                        imageUrl = m.ImageUrl,
                        senderId = m.SenderId,
                        isOwn = m.SenderId == userId,
                        time = m.CreatedAt.ToString("HH:mm"),
                        date = m.CreatedAt.ToString("dd/MM/yyyy")
                    })
                    .ToListAsync();

                var unreadMessages = await _context.Messages
                    .Where(m => m.SenderId == partnerId && m.ReceiverId == userId && !m.IsRead)
                    .ToListAsync();

                foreach (var msg in unreadMessages)
                {
                    msg.IsRead = true;
                }
                await _context.SaveChangesAsync();

                return Json(new { success = true, messages });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting messages");
                return Json(new { success = false });
            }
        }

        /// <summary>
        /// Gửi hình ảnh (Chưa fix) (Chỗ này phải sửa reseize ảnh nếu quá to hoặc quá nhỏ và định dạng file ảnh)
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> SendMessage([FromForm] SendMessageDto dto)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
                    return Json(new { success = false });

                var (success, errorMessage, messageData) = await _messageService.SendMessageAsync(
                    userId, dto.ReceiverId, dto.Content ?? "", dto.Image);

                if (!success)
                    return Json(new { success = false, message = errorMessage });

                return Json(new { success = true, message = messageData });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending message");
                return Json(new { success = false });
            }
        }

        private string GetTimeAgo(DateTime dateTime)
        {
            var timeSpan = DateTime.Now - dateTime;

            if (timeSpan.TotalMinutes < 1) return "Vừa xong";
            if (timeSpan.TotalMinutes < 60) return $"{(int)timeSpan.TotalMinutes}p";
            if (timeSpan.TotalHours < 24) return $"{(int)timeSpan.TotalHours}h";
            if (timeSpan.TotalDays < 7) return $"{(int)timeSpan.TotalDays}d";
            
            return dateTime.ToString("dd/MM");
        }
    }
}
