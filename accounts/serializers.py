from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.password_validation import validate_password

from accounts.models import KYC

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            "email",
            "password",
            "first_name",
            "last_name",
            "phone_number",
            "country",
            "state",
            "city",
            "full_address",
            "default_pickup_warehouse"
        ]
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already registered")
        return value

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data.get("email"),
            password=validated_data.get("password"),
            first_name=validated_data.get("first_name"),
            last_name=validated_data.get("last_name"),
        )

        user.phone_number = validated_data.get("phone_number")
        user.country = validated_data.get("country")
        user.state = validated_data.get("state")
        user.city = validated_data.get("city")
        user.full_address = validated_data.get("full_address")
        user.default_pickup_warehouse = validated_data.get("default_pickup_warehouse")

        user.save()

        return user







class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(
            username=data.get("email"),  # 🔥 paske USERNAME_FIELD = email
            password=data.get("password")
        )

        if not user:
            raise serializers.ValidationError({
                "non_field_errors": ["Invalid email or password"]
            })

        data["user"] = user
        return data





class KYCSerializer(serializers.ModelSerializer):

    class Meta:
        model = KYC

        fields = [
            "id",
            "document_type",
            "front_image",
            "back_image",
            "selfie_image",
            "status",
            "submitted_at",
        ]

        read_only_fields = [
            "status",
            "submitted_at",
        ]