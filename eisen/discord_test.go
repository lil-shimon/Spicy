package main

import (
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestSendDiscordMessage(t *testing.T) {
	t.Run("200成功", func(t *testing.T) {
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

		if gotMethod != http.MethodPost {
			t.Errorf("メソッドが POST であるべきだが %q だった", gotMethod)
		}
		if gotContentType != "application/json" {
			t.Errorf("Content-Type が application/json であるべきだが %q だった", gotContentType)
		}

		var payload map[string]string
		if err := json.Unmarshal(gotBody, &payload); err != nil {
			t.Fatalf("リクエストボディのJSONパースに失敗: %v", err)
		}
		if payload["content"] != "テスト通知" {
			t.Errorf("content が %q であるべきだが %q だった", "テスト通知", payload["content"])
		}
	})

	t.Run("204成功", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusNoContent)
		}))
		defer server.Close()

		err := SendDiscordMessage(server.URL, "204テスト")
		if err != nil {
			t.Fatalf("エラーが返されないはずが返された: %v", err)
		}
	})

	t.Run("500エラー", func(t *testing.T) {
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.WriteHeader(http.StatusInternalServerError)
		}))
		defer server.Close()

		err := SendDiscordMessage(server.URL, "500テスト")
		if err == nil {
			t.Fatal("エラーが返されるはずが nil だった")
		}
		if !strings.Contains(err.Error(), "異常ステータス") {
			t.Errorf("エラーメッセージに「異常ステータス」が含まれるべきだが %q だった", err.Error())
		}
	})

	t.Run("空メッセージ", func(t *testing.T) {
		var gotBody []byte
		server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			gotBody, _ = io.ReadAll(r.Body)
			w.WriteHeader(http.StatusNoContent)
		}))
		defer server.Close()

		err := SendDiscordMessage(server.URL, "")
		if err != nil {
			t.Fatalf("エラーが返されないはずが返された: %v", err)
		}
		var payload struct{ Content string }
		if err := json.Unmarshal(gotBody, &payload); err != nil {
			t.Fatalf("リクエストボディのJSONパースに失敗: %v", err)
		}
		if payload.Content != "" {
			t.Errorf("content が空であるべきだが %q だった", payload.Content)
		}
	})
}
