namespace Backend.Models;

using System.ComponentModel.DataAnnotations;

public class AgendaDto
{
    public int AgendaID { get; set; } 
    public string MecanicoNumero { get; set; } = string.Empty;
    public int ServicoID { get; set; }
    public string TipoSlot { get; set; } = string.Empty; // ex: "Diagnostico", "Reparacao"
    public int? IntervencaoID { get; set; }
    public DateTime DataHoraInicio { get; set; }
    public string Estado { get; set; } = "Agendado";
}

public class AgendaCriacaoDto
{
    [Required]
    public int AgendaID { get; set; }
    
    public string MecanicoNumero { get; set; } = string.Empty; 
    
    [Required]
    public int ServicoID { get; set; } 
    
    [Required]
    public string TipoSlot { get; set; } = string.Empty;
    
    public int IntervencaoID { get; set; }
    
    [Required]
    public DateTime DataHoraInicio { get; set; }
    
    public string Estado { get; set; } = "Agendado";
}