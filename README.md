
# <span style="color: #ff6b6b; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">DEVMTU</span><span style="color: #4ecdc4; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);"></span>

[![.NET](https://img.shields.io/badge/.NET-8.0-blue.svg)](https://dotnet.microsoft.com/download)
[![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-8.0-green.svg)](https://docs.microsoft.com/en-us/aspnet/core/)
[![Entity Framework](https://img.shields.io/badge/Entity%20Framework-8.0-orange.svg)](https://docs.microsoft.com/en-us/ef/)
[![SQL Server](https://img.shields.io/badge/SQL%20Server-2022-red.svg)](https://www.microsoft.com/en-us/sql-server)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## <span style="color: #667eea; background: linear-gradient(45deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Tổng quan</span>

</> MTU là một website mạng xã hội được phát triển bằng ASP.NET Core MVC.

## <span style="color: #f093fb; background: linear-gradient(45deg, #f093fb, #f5576c); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Tính năng chính(sẽ được update sau)</span>

## <span style="color: #667eea; background: linear-gradient(45deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Công nghệ sử dụng</span>

### <span style="color: #4facfe; background: linear-gradient(45deg, #4facfe, #00f2fe); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Backend</span>
- **ASP.NET Core 8.0** - Web framework
- **Entity Framework Core 8.0** - ORM
- **SQL Server** - Database
- **C# 10** - Programming language

### <span style="color: #43e97b; background: linear-gradient(45deg, #43e97b, #38f9d7); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Frontend</span>
- **HTML5, CSS3, JavaScript** - Core web technologies
- **Bootstrap 5** - CSS framework
- **jQuery** - JavaScript library
- **Responsive Design** - Mobile-first approach

### <span style="color: #fa709a; background: linear-gradient(45deg, #fa709a, #fee140); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Tools & Libraries</span>
- **Git** - Version control
- **GitHub** - Code repository
- **Visual Studio 2022** - IDE
- **SQL Server Management Studio** - Database management

## <span style="color: #667eea; background: linear-gradient(45deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Cài đặt và chạy dự án</span>

### <span style="color: #4facfe; background: linear-gradient(45deg, #4facfe, #00f2fe); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Yêu cầu hệ thống</span>
- Windows 10/11 hoặc macOS hoặc Linux
- .NET 8.0 SDK
- SQL Server 2022 hoặc mới hơn
- Visual Studio 2022 hoặc VS Code

### <span style="color: #43e97b; background: linear-gradient(45deg, #43e97b, #38f9d7); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Bước 1: Clone repository</span>
```bash
git clone https://github.com/cogkhang269/DevMTU.git
```

### <span style="color: #fa709a; background: linear-gradient(45deg, #fa709a, #fee140); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Bước 2: Cài đặt dependencies</span>
```bash
# Restore NuGet packages
dotnet restore

# Hoặc sử dụng Package Manager Console trong Visual Studio
Install-Package Microsoft.EntityFrameworkCore.SqlServer
Install-Package Microsoft.EntityFrameworkCore.Tools
Install-Package Microsoft.EntityFrameworkCore.Design
```

### <span style="color: #a8edea; background: linear-gradient(45deg, #a8edea, #fed6e3); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Bước 3: Cấu hình database</span>
```bash
# Cập nhật connection string trong appsettings.json
{
  "ConnectionStrings": {
        "DefaultConnection": "Server=(localname);Database=MTUSocial;User Id=sa;Password=pass;TrustServerCertificate=True;"
  }
}
```

### <span style="color: #ffecd2; background: linear-gradient(45deg, #ffecd2, #fcb69f); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Bước 4: Tạo database</span>
```bash
# Khởi tạo SQL bằng file devmtu.sql
thực thi lệnh trong SQL
sử dụng ChatGPT nếu không thể làm
```

### <span style="color: #667eea; background: linear-gradient(45deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Bước 5: Chạy ứng dụng</span>
```bash
# Chạy development server
dotnet run

# Hoặc sử dụng Visual Studio
# Nhấn F5 hoặc Ctrl+F5
```

## <span style="color: #667eea; background: linear-gradient(45deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Cấu trúc dự án</span>

```
Cập nhật sau
```

## <span style="color: #667eea; background: linear-gradient(45deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Cấu trúc Database</span>

```
Cập nhật sau
```


## <span style="color: #667eea; background: linear-gradient(45deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Dữ liệu mẫu</span>

```
User1: admin/126HUKOAnGqN
User2: ad2/JgZ49pBUTw5
Truy cập đường dẫn wwwroot/user/tkmk.json sau khi đăng kí
```


## <span style="color: #667eea; background: linear-gradient(45deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Performance</span>

```
Cập nhật sau
```

## <span style="color: #667eea; background: linear-gradient(45deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Bảo mật</span>

- ✅ **Password Hashing** - Mã hóa mật khẩu với BCrypt
- ✅ **Input Validation** - Xác thực dữ liệu đầu vào
- ✅ **SQL Injection Prevention** - Sử dụng Entity Framework


## <span style="color: #667eea; background: linear-gradient(45deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Deployment</span>

### **GitHub Actions CI/CD**
```yaml
name: Build and Deploy
on:
  push:
    branches: [ main ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Setup .NET
      uses: actions/setup-dotnet@v3
    - name: Build
      run: dotnet build
    - name: Test
      run: dotnet test
```

### **Azure Deployment**
```bash
# Deploy to Azure App Service
az webapp deployment source config-zip --resource-group myResourceGroup --name myAppName --src myapp.zip
```

## <span style="color: #667eea; background: linear-gradient(45deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Documentation</span>

- [Database Setup Guide](DATABASE_SETUP_GUIDE.md)
- [Image Optimization Guide](IMAGE_OPTIMIZATION_GUIDE.md)
- [GitHub Deployment Guide](GITHUB_DEPLOYMENT_GUIDE.md)


## <span style="color: #667eea; background: linear-gradient(45deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Báo lỗi</span>

Nếu bạn gặp lỗi, vui lòng:
1. Kiểm tra [Issues](https://github.com/cogkhang269/KNTStore/issues)
2. Tạo issue mới với thông tin chi tiết
3. Bao gồm steps để reproduce lỗi

## <span style="color: #667eea; background: linear-gradient(45deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Liên hệ</span>

- **Email:** 
- **GitHub:** [@KP22](https://github.com/cogkhang269)


## <span style="color: #667eea; background: linear-gradient(45deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">License</span>

Distributed under the MIT License. See `LICENSE` for more information.

## <span style="color: #667eea; background: linear-gradient(45deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Acknowledgments</span>

- [ASP.NET Core Documentation](https://docs.microsoft.com/en-us/aspnet/core/)
- [Entity Framework Documentation](https://docs.microsoft.com/en-us/ef/)
- [Bootstrap](https://getbootstrap.com/)
- [jQuery](https://jquery.com/)

---

<div align="center">

**Nếu dự án hữu ích, hãy cho một star!**

Made with <span style="color: #ff6b6b;">❤</span> by [KP22](https://github.com/cogkhang269)

</div>


