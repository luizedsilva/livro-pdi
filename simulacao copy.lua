-- =========================
-- Filtro: simulacao.lua
-- =========================

local document_meta = {}

-- local function warn(msg)
--   io.stderr:write("[simulacao.lua] " .. msg .. "\n")
-- end

local function file_exists(path)
  if path == nil or path == "" then return false end
  local f = io.open(path, "r")
  if f then
    f:close()
    return true
  end
  return false
end

-- 1. Captura Metadados Globais
local function get_metadata(meta)
  document_meta = meta
  return meta
end

function CodeBlock(el)
  local classes = el.classes or {}
  table.insert(classes, "CodeBlock")

  return pandoc.CodeBlock(
    el.text,
    pandoc.Attr(el.identifier or "", classes, el.attributes or {})
  )
end

-- 2. Processa as Divs
local function process_div(el)
  if not el.classes:includes("simulacao") then
    return nil
  end

  -- Função ajustada para priorizar atributos da Div
  local function get_attr_or_meta(name)
    -- Primeiro tenta pegar o atributo direto da div (ex: url="...")
    local val = el.attributes[name]
    
    -- Se não achar, tenta pegar do meta (ex: app-url: "...")
    if (val == nil or val == "") then
      -- Mapeia os nomes curtos da div para os nomes longos do meta
      local meta_key = "app-" .. name
      if document_meta[meta_key] then
        val = pandoc.utils.stringify(document_meta[meta_key])
      end
    end
    
    return val or ""
  end

  -- Busca os valores priorizando o escopo local
  local url    = get_attr_or_meta("url")
  local height = get_attr_or_meta("height")
  if height == "" then height = "400" end -- Default
  local imagem = get_attr_or_meta("imagem")
  local qrcode = get_attr_or_meta("qrcode")

--   -- Validação
--   if url == "" then 
--     warn("URL não definida para simulação.") 
--   end
  
--   if imagem ~= "" and not file_exists(imagem) then
--     warn("Imagem não encontrada: " .. imagem)
--     imagem = ""
--   end

  -- Renderização HTML
  if FORMAT:match("html") then
    if url ~= "" then
      local html = string.format(
        '<div class="simulacao-container"><iframe src="%s" width="100%%" height="%s" style="border:none;"></iframe></div>',
        url, height
      )
      return pandoc.RawBlock("html", html)
    else
      return pandoc.Para({pandoc.Emph(pandoc.Str("Simulação não disponível."))})
    end
  end

  -- Renderização LaTeX (PDF)
  if FORMAT:match("latex") then
    local latex = ""
    if imagem ~= "" then
      -- Adicionado [H] para forçar a posição e evitar que as imagens flutuem e se misturem
      latex = latex .. "\\begin{figure}[H]\n\\centering\n\\fbox{\\includegraphics[width=0.6\\textwidth]{" .. imagem .. "}}\n"
      latex = latex .. "\\caption{Visualização da aplicação interativa}\n\\end{figure}\n"
    end
    if url ~= "" then
      -- Usa a biblioteca skins (enhanced) para evitar erros de renderização
      latex = latex .. "\\begin{tcolorbox}[enhanced jigsaw, title=Acesso Interativo]\nAcesse a simulação em: \\url{" .. url .. "}\n"
      if qrcode ~= "" and file_exists(qrcode) then
        latex = latex .. "\\begin{center}\\includegraphics[width=3cm]{" .. qrcode .. "}\\end{center}\n"
      end
      latex = latex .. "\\end{tcolorbox}\n"
    end
    return pandoc.RawBlock("latex", latex)
  end

  -- Renderização EPUB
    if FORMAT:match("epub") then
        local blocks = {}
        if imagem ~= "" then
            table.insert(blocks, pandoc.Para({ pandoc.Image({ pandoc.Str("Simulação") }, imagem) }))
        end
        if url ~= "" then
            table.insert(blocks, pandoc.Para({ pandoc.Str("Acesse: "), pandoc.Link(pandoc.Str(url), url) }))
            if qrcode ~= "" and file_exists(qrcode) then
                table.insert(blocks, pandoc.Para({ pandoc.Image({ pandoc.Str("QR") }, qrcode, "", { width = "100px" }) }))
            end
        end
        return blocks
    end
  
-- Renderização DOCX (versão mais sofisticada)
    if FORMAT:match("docx") then
        local blocks = {}

  -- Título do bloco
        table.insert(blocks,
        pandoc.Para({
            pandoc.Strong(pandoc.Str("Simulação Interativa"))
            })
  )

  -- Linha separadora (simples e funciona bem no Word)
  table.insert(blocks,
    pandoc.Para({pandoc.Str("------------------------------")})
  )

  -- Imagem (preview da simulação)
  if imagem ~= "" then
    table.insert(blocks,
      pandoc.Para({
        pandoc.Image({pandoc.Str("Visualização da aplicação")}, imagem)
      })
    )
  end

  -- Texto + link
  if url ~= "" then
    table.insert(blocks,
      pandoc.Para({
        pandoc.Str("Acesse a simulação: "),
        pandoc.Link(pandoc.Str(url), url)
      })
    )
  end

  -- QR Code centralizado
  if qrcode ~= "" and file_exists(qrcode) then
    table.insert(blocks,
      pandoc.Para({
        pandoc.Image({pandoc.Str("QR Code")}, qrcode, "", {width="120px"})
      })
    )
  end

  -- Linha inferior
  table.insert(blocks,
    pandoc.Para({pandoc.Str("------------------------------")})
  )

  return blocks
end

  return nil
end

return {
  { Meta = get_metadata },
  { Div = process_div }
}