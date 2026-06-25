package com.edu.service;

import com.edu.common.BusinessException;
import com.edu.dto.request.LoginRequest;
import com.edu.dto.response.LoginResponse;
import com.edu.entity.SysUser;
import com.edu.repository.SysUserRepository;
import com.edu.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final SysUserRepository sysUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    public LoginResponse login(LoginRequest request) {
        SysUser user = sysUserRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BusinessException(401, "用户名或密码错误"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BusinessException(401, "用户名或密码错误");
        }

        if (user.getStatus() != 1) {
            throw new BusinessException(403, "账号已被禁用");
        }

        user.setLastLoginAt(LocalDateTime.now());
        sysUserRepository.save(user);

        String token = jwtUtil.generateToken(user.getId(), user.getUsername(), user.getRole());
        return new LoginResponse(token, user.getRole(), user.getUsername(), jwtExpiration / 1000);
    }

    public void changePassword(Long userId, String oldPassword, String newPassword) {
        SysUser user = sysUserRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("用户不存在"));

        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new BusinessException("原密码错误");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        sysUserRepository.save(user);
    }
}
