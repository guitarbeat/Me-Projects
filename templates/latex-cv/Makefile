OUT=build

# LaTeX CV source
LATEX_TEX=methods/latex/CV.tex

.PHONY: all
all: latex

# LaTeX method (hand-written)
.PHONY: latex
latex: $(OUT)/latex/CV.pdf

$(OUT)/latex:
	mkdir -p "$@"

$(OUT)/latex/CV.pdf: $(LATEX_TEX) | $(OUT)/latex
	MKTEXTFM=0 xelatex -output-directory="$(OUT)/latex" "$(LATEX_TEX)"
	if grep -q "Rerun to get" "$(OUT)/latex/CV.log" || grep -q "Rerun LaTeX" "$(OUT)/latex/CV.log" || grep -q "rerunfilecheck Warning" "$(OUT)/latex/CV.log"; then \
		MKTEXTFM=0 xelatex -output-directory="$(OUT)/latex" "$(LATEX_TEX)"; \
	fi

.PHONY: context extract validate
context: extract validate

extract:
	./scripts/context_tools.sh extract

validate: latex
	./scripts/context_tools.sh validate

.PHONY: clean
clean:
	rm -rf "$(OUT)"
