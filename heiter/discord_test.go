package main

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestSendDiscordMessage_Success200(t *testing.T) {
	var gotMethod string
	var gotContentType string
	var gotBody []byte

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		gotMethod = r.Method
		gotContentType = r.Header.Get("Content-Type")
		var err error
		gotBody, err = io.ReadAll(r.Body)
		if err != nil {
			t.Fatalf("リクエストボディの読み取りに失敗: %v", err)
		}
		w.WriteHeader(http.StatusOK)
	}))
	defer server.Close()

	err := SendDiscordMessage(server.URL, "テスト通知")
	if err != nil {
		t.Fatalf("エラーが返されないはずが返された: %v", err)
	}

	// HTTPメソッドの検証
	if gotMethod != http.MethodPost {
		t.Errorf("メソッドが POST であるべきだが %q だった", gotMethod)
	}

	// Content-Typeの検証
	if gotContentType != "application/json" {
		t.Errorf("Content-Type が application/json であるべきだが %q だった", gotContentType)
	}

	// リクエストボディのJSON検証
	var payload map[string]string
	if err := json.Unmarshal(gotBody, &payload); err != nil {
		t.Fatalf("リクエストボディのJSONパースに失敗: %v", err)
	}
	if payload["content"] != "テスト通知" {
		t.Errorf("content が %q であるべきだが %q だった", "テスト通知", payload["content"])
	}
}

func TestSendDiscordMessage_Success204(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))
	defer server.Close()

	err := SendDiscordMessage(server.URL, "204テスト")
	if err != nil {
		t.Fatalf("エラーが返されないはずが返された: %v", err)
	}
}

func TestSendDiscordMessage_ServerError500(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusInternalServerError)
	}))
	defer server.Close()

	err := SendDiscordMessage(server.URL, "500テスト")
	if err == nil {
		t.Fatal("エラーが返されるはずが nil だった")
	}

	// エラーメッセージに「異常ステータス」が含まれることを検証
	if got := err.Error(); !strings.Contains(got, "異常ステータス") {
		t.Errorf("エラーメッセージに「異常ステータス」が含まれるべきだが %q だった", got)
	}
}

func TestSendDiscordMessage_InvalidURL(t *testing.T) {
	err := SendDiscordMessage("", "無効URLテスト")
	if err == nil {
		t.Fatal("空URLでエラーが返されるはずが nil だった")
	}

	err = SendDiscordMessage("://invalid", "無効URLテスト")
	if err == nil {
		t.Fatal("不正URLでエラーが返されるはずが nil だった")
	}
}
