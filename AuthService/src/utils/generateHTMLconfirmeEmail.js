export function genEmailHTMLVerification(token) {
    return `
        <!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Підтвердження Email</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f5f5f5;
        }
        
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        
        .header {
            padding: 30px 30px 15px;
        }
        
        .content {
            padding: 0 30px 20px;
        }
        
        .footer {
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #999999;
        }
        
        .button {
            display: inline-block;
            background-color: #4CAF50;
            color: #ffffff;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
            margin: 25px 0;
        }
        
        h1 {
            color: #333333;
            margin-top: 0;
        }
        
        p {
            margin: 16px 0;
            font-size: 16px;
            color: #555555;
        }
        
        .small {
            font-size: 14px;
            color: #999999;
        }
        
        .outlook-table {
            border-collapse: collapse;
            border-spacing: 0;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        
        img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
        }
    </style>
</head>
<body>
    
    <div class="container">
        <div class="header">
            <h1>Підтвердіть свій Email</h1>
        </div>
        
        <div class="content">
            <p>Дякуємо за реєстрацію! Використайте код нижче, щоб підтвердити свою електронну адресу.</p>
            
            <center>
                <a href="{{verification_link}}" class="button">
                    ${token}
                </a>
            </center>       
            
            <p class="small">Якщо ви не реєструвалися, просто проігноруйте цей лист.</p>
        </div>
        
        <div class="footer">
            &copy; <span class="current-year">2025</span> Your Company. Усі права захищено.
        </div>
    </div>
</body>
</html>
`
}

export function genEmailHTMLPasswordResetting(link) {
    return `
        <!DOCTYPE html>
<html lang="uk">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Підтвердження Email</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f5f5f5;
        }
        
        .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        
        .header {
            padding: 30px 30px 15px;
        }
        
        .content {
            padding: 0 30px 20px;
        }
        
        .footer {
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #999999;
        }
        
        .button {
            display: inline-block;
            background-color: #4CAF50;
            color: #ffffff;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
            margin: 25px 0;
        }
        
        h1 {
            color: #333333;
            margin-top: 0;
        }
        
        p {
            margin: 16px 0;
            font-size: 16px;
            color: #555555;
        }
        
        .small {
            font-size: 14px;
            color: #999999;
        }
        
        .outlook-table {
            border-collapse: collapse;
            border-spacing: 0;
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }
        
        img {
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
            -ms-interpolation-mode: bicubic;
        }
    </style>
</head>
<body>
    
    <div class="container">
        <div class="header">
            <h1>Підтвердіть свій Email</h1>
        </div>
        
        <div class="content">
            <p>Ви плануєте скинути свій поточний пароль! Натисніть кнопку нижче, щоб підтвердити свою електронну адресу.</p>
            
            <center>
                <a href="${link}" class="button">
                    
                </a>
            </center>       
            
            <p class="small">Якщо ви не намагаєтесь скинути свій пароль, просто проігноруйте цей лист.</p>
        </div>
        
        <div class="footer">
            &copy; <span class="current-year">2025</span> Your Company. Усі права захищено.
        </div>
    </div>
</body>
</html>
`
}
