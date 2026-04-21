import 'package:equatable/equatable.dart';

/// User model for authentication responses
class User extends Equatable {
  final String id;
  final String email;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const User({
    required this.id,
    required this.email,
    required this.createdAt,
    this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['_id'] ?? json['id'] ?? '',
      email: json['email'] ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'email': email,
      'createdAt': createdAt.toIso8601String(),
      if (updatedAt != null) 'updatedAt': updatedAt!.toIso8601String(),
    };
  }

  @override
  List<Object?> get props => [id, email, createdAt, updatedAt];
}

/// Authentication response model
class AuthResponse extends Equatable {
  final String accessToken;
  final String? refreshToken;
  final User user;
  final int expiresIn;

  const AuthResponse({
    required this.accessToken,
    this.refreshToken,
    required this.user,
    required this.expiresIn,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      accessToken: json['accessToken'] ?? '',
      refreshToken: json['refreshToken'],
      user: User.fromJson(json['user'] ?? {}),
      expiresIn: json['expiresIn'] ?? 900,
    );
  }

  @override
  List<Object?> get props => [accessToken, refreshToken, user, expiresIn];
}
