package com.saas.Dashboard.controller;

import com.saas.Dashboard.dto.InviteMemberRequest;
import com.saas.Dashboard.dto.MemberResponse;
import com.saas.Dashboard.service.MemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @PostMapping("/invite")
    public ResponseEntity<MemberResponse> invite(@Valid @RequestBody InviteMemberRequest request) {
        return ResponseEntity.ok(memberService.inviteMember(request));
    }

    @GetMapping
    public ResponseEntity<List<MemberResponse>> getAll() {
        return ResponseEntity.ok(memberService.getAllMembers());
    }
}