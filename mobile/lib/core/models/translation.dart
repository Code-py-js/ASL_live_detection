import 'package:equatable/equatable.dart';

/// Translation model for API responses
class Translation extends Equatable {
  final String id;
  final String userId;
  final String signText;
  final String translatedText;
  final double confidence;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const Translation({
    required this.id,
    required this.userId,
    required this.signText,
    required this.translatedText,
    required this.confidence,
    required this.createdAt,
    this.updatedAt,
  });

  factory Translation.fromJson(Map<String, dynamic> json) {
    return Translation(
      id: json['_id'] ?? json['id'] ?? '',
      userId: json['userId'] ?? '',
      signText: json['signText'] ?? '',
      translatedText: json['translatedText'] ?? '',
      confidence: (json['confidence'] ?? 0.0).toDouble(),
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
      'userId': userId,
      'signText': signText,
      'translatedText': translatedText,
      'confidence': confidence,
      'createdAt': createdAt.toIso8601String(),
      if (updatedAt != null) 'updatedAt': updatedAt!.toIso8601String(),
    };
  }

  @override
  List<Object?> get props => [
        id,
        userId,
        signText,
        translatedText,
        confidence,
        createdAt,
        updatedAt
      ];
}

/// Translations list response model
class TranslationsResponse extends Equatable {
  final List<Translation> translations;
  final int page;
  final int limit;
  final int total;
  final int totalPages;

  const TranslationsResponse({
    required this.translations,
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });

  factory TranslationsResponse.fromJson(Map<String, dynamic> json) {
    final translationsList = (json['translations'] as List<dynamic>?)
            ?.map((item) => Translation.fromJson(item as Map<String, dynamic>))
            .toList() ??
        [];

    return TranslationsResponse(
      translations: translationsList,
      page: json['page'] ?? 1,
      limit: json['limit'] ?? 10,
      total: json['total'] ?? 0,
      totalPages: json['totalPages'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'translations': translations.map((t) => t.toJson()).toList(),
      'page': page,
      'limit': limit,
      'total': total,
      'totalPages': totalPages,
    };
  }

  @override
  List<Object?> get props => [translations, page, limit, total, totalPages];
}
