import 'package:flutter/material.dart';
import 'account_screen.dart';
import 'login_screen.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  bool isLoggedIn = false;

  void updateLoginStatus(bool status) {
    setState(() {
      isLoggedIn = status;
    });
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'HouseClean',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.orange),
        useMaterial3: true,
      ),
      home: MainScreen(isLoggedIn: isLoggedIn, onLogin: updateLoginStatus),
    );
  }
}

class MainScreen extends StatefulWidget {
  final bool isLoggedIn;
  final Function(bool) onLogin;

  const MainScreen({super.key, required this.isLoggedIn, required this.onLogin});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _selectedIndex = 0;

  final List<Widget> _screens = [
    const HomeScreen(),
    const ActivityScreen(),
    const MessageScreen(),
    const Placeholder(),
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  void _navigateToLogin() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => LoginScreen(onLogin: widget.onLogin),
      ),
    );
  }

  void _navigateToAccount() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AccountScreen(isLoggedIn: widget.isLoggedIn, onLogout: widget.onLogin),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Column(
        children: [
          if (!widget.isLoggedIn)
            Container(
              color: Colors.grey[200],
              padding: const EdgeInsets.all(16),
              child: ElevatedButton(
                onPressed: _navigateToLogin,
                style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                child: const Text("Đăng nhập / Tạo tài khoản", style: TextStyle(color: Colors.white)),
              ),
            ),
          Expanded(
            child: _selectedIndex == 3
                ? AccountScreen(isLoggedIn: widget.isLoggedIn, onLogout: widget.onLogin)
                : _screens[_selectedIndex],
          ),
        ],
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
        selectedItemColor: Colors.orange,
        unselectedItemColor: Colors.grey,
        showUnselectedLabels: true,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home), label: "Trang chủ"),
          BottomNavigationBarItem(icon: Icon(Icons.list_alt), label: "Hoạt động"),
          BottomNavigationBarItem(icon: Icon(Icons.message), label: "Tin nhắn"),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: "Tài khoản"),
        ],
      ),
    );
  }
}

class EmptyScreen extends StatelessWidget {
  final String title;
  const EmptyScreen({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return Center(child: Text("Chưa có màn hình $title"));
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const EmptyScreen(title: "Trang chủ");
  }
}

class ActivityScreen extends StatelessWidget {
  const ActivityScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const EmptyScreen(title: "Hoạt động");
  }
}

class MessageScreen extends StatelessWidget {
  const MessageScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const EmptyScreen(title: "Tin nhắn");
  }
}
