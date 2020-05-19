**2020-1 서울시립대학교 클라우드컴퓨팅 Term Project 계획서**

2015920003 컴퓨터과학부 김건호

![uuuurl](./img/uuuurl_plus.png)



## 프로젝트 개요 및 목적

Key-Value Store(이하 'KVS')의 가장 큰 장점은 간단한 구조와 해쉬를 통한 빠른 데이터 접근이다. 데이터에 고유값(key)이 있고 이를 통한 검색 요청이 잦다면 KVS는 아주 매력적이다. 따라서 본 프로젝트는 KVS의 목표와 장점을 확인하기 위해 잦은 검색 요청을 처리하는 서비스를 개발한다.

본 프로젝트에서는 URL 단축 서비스 `uuuurl`을 개발한다. 이미 goo.gl, bit.ly 등 많은 URL 단축 서비스가 존재하지만, 대부분 광고가 붙거나, 속도가 매우 느리거나, 유료로 제공되거나, 서비스가 중단되는 등 불편한 점이 많다. 이번 프로젝트를 통해, 가볍고 빠르게 사용할 개인 URL Shortener를 만들어본다. 본 프로젝트는 [Github](https://github.com/gunhoflash/uuuurl)을 통해 오픈소스로 공개되므로, 서버만 준비된다면 얼마든지 개인 URL Shortener를 쉽게 구축할 수 있을 것이다.



## 서비스 요구사항

uuuurl은 다음 기능을 제공한다.

- URL 단축 등록/삭제
- 단축된 모든 URL 조회



## 동작환경 및 기술 스택

- Language: javascript
- Framework: Node.js (on firebase)
- DB: FireStore (on firebase)
