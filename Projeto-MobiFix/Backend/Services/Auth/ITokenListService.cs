namespace Backend.Services;

public interface ITokenListService
{
    void Whitelist(string jti, DateTimeOffset expiresAt);
    void Revoke(string jti);
    bool IsAllowed(string jti);
}
