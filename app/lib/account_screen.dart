import 'package:flutter/material.dart';
import 'login_screen.dart';

class AccountScreen extends StatelessWidget {
  final bool isLoggedIn;
  final Function(bool) onLogout;

  const AccountScreen({super.key, required this.isLoggedIn, required this.onLogout});

  void _logout(BuildContext context) {
    onLogout(false);
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.white,
            child: Row(
              children: [
                const CircleAvatar(
                  radius: 30,
                  backgroundColor: Colors.grey,
                  child: Icon(Icons.person, size: 40, color: Colors.white),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isLoggedIn ? "Tài khoản của bạn" : "Chưa đăng nhập",
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      if (!isLoggedIn)
                        ElevatedButton(
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => LoginScreen(onLogin: onLogout)),
                            );
                          },
                          child: const Text("Đăng nhập / Đăng ký"),
                        )
                    ],
                  ),
                ),
              ],
            ),
          ),
          const Divider(),
          if (isLoggedIn)
            ElevatedButton(
              onPressed: () => _logout(context),
              child: const Text("Đăng xuất"),
            ),
        ],
      ),
    );
  }
}
