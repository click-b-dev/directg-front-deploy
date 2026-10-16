<?php if ($type === 'obj') { ?>
<div class="card mb-3 shadow-sm question" id="question_{{idx}}">
    <input type="hidden" class="question-idx-val" name="surveyQuestionIdx[{{idx}}]" value="{{idx}}">
    
    <div class="card-header d-flex justify-content-between align-items-center bg-white py-2">
        <div class="d-flex align-items-center gap-3">
            <span class="fw-bold text-secondary"><b><span class="item-num question-idx">{{itemNum}}</span>번 : 객관식 문항</b></span>
            <div class="form-check mb-0">
                <input class="form-check-input" type="checkbox" name="surveyQuestionRequired[{{idx}}]" value="Y" id="surveyQuestionRequired_{{idx}}" {{required_checked}}>
                <label class="form-check-label text-muted small" for="surveyQuestionRequired_{{idx}}">필수응답</label>
            </div>
        </div>
        <div class="btn-group btn-group-sm">
            <!-- <button type="button" class="btn btn-light border btn-xs" onclick="moveTop(this)">맨위</button> -->
            <button type="button" class="btn btn-light border btn-xs" onclick="moveUp(this)">위</button>
            <button type="button" class="btn btn-light border btn-xs" onclick="moveDown(this)">아래</button>
            <!-- <button type="button" class="btn btn-light border btn-xs" onclick="moveBottom(this)">맨아래</button> -->
            <button type="button" class="btn btn-light border btn-xs text-danger" onclick="deleteQuestion(this)">문항삭제</button>
            <button type="button" class="btn btn-light border btn-xs" onclick="cloneQuestion(this)">문항복사</button>
        </div>
    </div>
    <div class="card-body p-0">
        <div class="row g-0 border-bottom align-items-center">
            <div class="col-sm-2 bg-light p-2 text-center small border-end fw-bold">응답방식</div>
            <div class="col-sm-10 p-2 d-flex gap-3">
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="surveyQuestionType[{{idx}}]" value="radio" id="single_{{idx}}" {{type_radio_checked}}>
                    <label class="form-check-label small" for="single_{{idx}}">1개 선택</label>
                </div>
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="surveyQuestionType[{{idx}}]" value="checkbox" id="multi_{{idx}}" {{type_checkbox_checked}}>
                    <label class="form-check-label small" for="multi_{{idx}}">여러 개 선택</label>
                </div>
            </div>
        </div>
        <div class="row g-0 align-items-top">
            <div class="col-sm-2 bg-light p-2 text-center small border-end fw-bold pt-3" style="min-height:120px;">내용</div>
            <div class="col-sm-10 p-3">
                <input type="text" name="surveyQuestionTitle[{{idx}}]" value="{{question_title}}" class="form-control form-control-sm mb-2 w-100" placeholder="질문을 입력하세요" maxlength="200">
                
                <div class="option-list" data-qidx="{{idx}}">
                    {{options_html}}
                </div>
                <div class="mt-2">
                    <button type="button" class="btn btn-white btn-sm border" onclick="addOption(this); return false;">추가</button>
                    <a href="#" class="btn btn-white btn-sm border" onclick="addEtcOption(this); return false;">기타의견 추가</a>
                </div>
            </div>
        </div>
    </div>
</div>

<?php } else { ?>
<div class="card mb-3 shadow-sm question" id="question_{{idx}}">
    <input type="hidden" class="question-idx-val" name="surveyQuestionIdx[{{idx}}]" value="{{idx}}">
    
    <div class="card-header d-flex justify-content-between align-items-center bg-white py-2">
        <div class="d-flex align-items-center gap-3">
            <span class="fw-bold text-secondary"><b><span class="item-num question-idx">{{itemNum}}</span>번 : 주관식 문항</b></span>
            <div class="form-check mb-0">
                <input class="form-check-input" type="checkbox" name="surveyQuestionRequired[{{idx}}]" value="Y" id="surveyQuestionRequired_{{idx}}" {{required_checked}}>
                <label class="form-check-label text-muted small" for="surveyQuestionRequired_{{idx}}">필수응답</label>
            </div>
        </div>
        <div class="btn-group btn-group-sm">
            <!-- <button type="button" class="btn btn-light border btn-xs" onclick="moveTop(this)">맨위</button> -->
            <button type="button" class="btn btn-light border btn-xs" onclick="moveUp(this)">위</button>
            <button type="button" class="btn btn-light border btn-xs" onclick="moveDown(this)">아래</button>
            <!-- <button type="button" class="btn btn-light border btn-xs" onclick="moveBottom(this)">맨아래</button> -->
            <button type="button" class="btn btn-light border btn-xs text-danger" onclick="deleteQuestion(this)">문항삭제</button>
            <button type="button" class="btn btn-light border btn-xs" onclick="cloneQuestion(this)">문항복사</button>
        </div>
    </div>
    <div class="card-body p-0">
        <div class="row g-0 border-bottom align-items-center">
            <div class="col-sm-2 bg-light p-2 text-center small border-end fw-bold">응답방식</div>
            <div class="col-sm-10 p-2">
                <div class="form-check">
                    <input class="form-check-input" type="radio" name="surveyQuestionType[{{idx}}]" value="descript" checked="">
                    <label class="form-check-label small fw-bold text-primary">주관식</label>
                </div>
            </div>
        </div>
        <div class="row g-0 align-items-center">
            <div class="col-sm-2 bg-light p-2 text-center small border-end fw-bold pt-3" style="min-height:60px;">내용</div>
            <div class="col-sm-10 p-3">
                <input type="text" name="surveyQuestionTitle[{{idx}}]" value="{{question_title}}" class="form-control form-control-sm w-100" placeholder="질문을 입력하세요" maxlength="200">
            </div>
        </div>
    </div>
</div>
<?php } ?>